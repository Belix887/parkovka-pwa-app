"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";

type DashboardStats = {
	totalEarnings: number;
	upcomingBookings: number;
	occupancyRate: number;
	activeSpots: number;
	depositHeld: number;
	depositReleased: number;
	conflicts: number;
};

type DashboardSpot = {
	id: string;
	title: string;
	pricePerHour: number;
	status: string;
	address: string;
};

type DashboardCalendarItem = {
	id: string;
	spotId: string;
	spotTitle: string;
	renterName: string;
	status: string;
	startAt: string;
	endAt: string;
};

type DashboardEmergencyItem = {
	id: string;
	spotId: string;
	spotTitle: string;
	renterId: string;
	renterName: string;
	status: string;
	startAt: string;
	endAt: string;
	ownerAmount: number;
};

type DashboardBlacklistItem = {
	id: string;
	renterId: string;
	renterName: string;
	reason: string;
	createdAt: string;
};

type DashboardConflictItem = {
	id: string;
	spotId: string;
	spotTitle: string;
	renterId: string;
	renterName: string;
	depositAmount: number;
	depositStatus: string;
	penaltyAmount: number;
	penaltyReason?: string | null;
	disputeOpenedAt: string | null;
	disputeResolvedAt: string | null;
	transactions: Array<{
		id: string;
		type: string;
		amount: number;
		description?: string | null;
		createdAt: string;
	}>;
};

type DashboardPayload = {
	stats: DashboardStats;
	spots: DashboardSpot[];
	calendar: DashboardCalendarItem[];
	emergency: DashboardEmergencyItem[];
	blacklist: DashboardBlacklistItem[];
	conflicts: DashboardConflictItem[];
};

const STATUS_VARIANTS: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> =
	{
		PENDING: { label: "В ожидании", variant: "info" },
		APPROVED: { label: "Подтверждена", variant: "success" },
		PAID: { label: "Оплачена", variant: "success" },
		DECLINED: { label: "Отклонена", variant: "warning" },
		CANCELLED: { label: "Отменена", variant: "error" },
	};

const SPOT_STATUS_VARIANTS: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "info" }> = {
	APPROVED: { label: "Одобрено", variant: "success" },
	AUTO_APPROVED: { label: "Авто-одобрено", variant: "success" },
	PENDING_REVIEW: { label: "На модерации", variant: "warning" },
	PENDING_VERIFICATION: { label: "Ожидает проверки", variant: "warning" },
	AUTO_REJECTED: { label: "Авто-отклонено", variant: "error" },
	REJECTED: { label: "Отклонено", variant: "error" },
	DRAFT: { label: "Черновик", variant: "default" },
};

const DEPOSIT_STATUS_VARIANTS: Record<
	string,
	{ label: string; variant: "default" | "success" | "warning" | "error" | "info" }
> = {
	DEFAULT: { label: "Неизвестно", variant: "default" },
	NOT_REQUIRED: { label: "Не требуется", variant: "default" },
	PENDING: { label: "Ожидает блокировки", variant: "warning" },
	HELD: { label: "Удерживается", variant: "warning" },
	PARTIALLY_RELEASED: { label: "Частично возвращен", variant: "info" },
	RELEASED: { label: "Возвращен", variant: "success" },
	FORFEITED: { label: "Удержан", variant: "error" },
	FAILED: { label: "Ошибка", variant: "error" },
};

function formatCurrency(value: number) {
	return new Intl.NumberFormat("ru-RU", {
		style: "currency",
		currency: "RUB",
		maximumFractionDigits: 0,
	}).format(value);
}

export default function OwnerDashboardPage() {
	const [data, setData] = useState<DashboardPayload | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [priceDrafts, setPriceDrafts] = useState<Record<string, string>>({});
	const [savingSpotId, setSavingSpotId] = useState<string | null>(null);
	const [processingBlacklist, setProcessingBlacklist] = useState<string | null>(null);
	const [processingDeposit, setProcessingDeposit] = useState<string | null>(null);
	const { showError, showSuccess, showInfo } = useToast();

	const fetchDashboard = useCallback(async () => {
		try {
			setLoading(true);
			const res = await fetch("/api/owner/dashboard", { cache: "no-store" });
			if (!res.ok) {
				throw new Error("Не удалось получить данные");
			}
			const payload: DashboardPayload = await res.json();
			setData(payload);
			setError(null);
			setPriceDrafts(
				Object.fromEntries(payload.spots.map((spot) => [spot.id, String(spot.pricePerHour)]))
			);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Произошла ошибка";
			setError(message);
			showError("Не удалось загрузить дашборд");
		} finally {
			setLoading(false);
		}
	}, [showError]);

	useEffect(() => {
		void fetchDashboard();
	}, [fetchDashboard]);

	const groupedCalendar = useMemo(() => {
		if (!data?.calendar) return [];
		const map = new Map<string, DashboardCalendarItem[]>();
		data.calendar.forEach((item) => {
			const key = format(parseISO(item.startAt), "yyyy-MM-dd");
			const list = map.get(key) || [];
			list.push(item);
			map.set(key, list);
		});
		return Array.from(map.entries()).sort(([a], [b]) => (a > b ? 1 : -1));
	}, [data?.calendar]);

	const handlePriceChange = (spotId: string, value: string) => {
		setPriceDrafts((prev) => ({ ...prev, [spotId]: value }));
	};

	const handlePriceSave = async (spotId: string) => {
		const draftValue = priceDrafts[spotId];
		if (!draftValue) return;
		const parsed = Number(draftValue);
		if (!Number.isFinite(parsed) || parsed <= 0) {
			showInfo("Введите корректную стоимость в час");
			return;
		}

		try {
			setSavingSpotId(spotId);
			const res = await fetch(`/api/owner/spots/${spotId}/pricing`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ pricePerHour: Math.round(parsed) }),
			});
			if (!res.ok) {
				throw new Error();
			}
			const updated = await res.json();
			setData((prev) =>
				prev
					? {
							...prev,
							spots: prev.spots.map((spot) =>
								spot.id === spotId ? { ...spot, pricePerHour: updated.pricePerHour } : spot
							),
					  }
					: prev
			);
			showSuccess("Тариф обновлен");
		} catch {
			showError("Не удалось сохранить тариф");
		} finally {
			setSavingSpotId(null);
		}
	};

	const handleAddToBlacklist = async (booking: DashboardEmergencyItem) => {
		const reason = window.prompt(
			`Укажите причину добавления арендатора "${booking.renterName}" в черный список`,
			"Частые отмены броней"
		);
		if (reason === null) return;
		try {
			setProcessingBlacklist(booking.renterId);
			const res = await fetch("/api/owner/blacklist", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ renterId: booking.renterId, reason }),
			});
			if (!res.ok) {
				const payload = await res.json().catch(() => ({}));
				throw new Error(payload.error || "Ошибка сервера");
			}
			const entry: DashboardBlacklistItem = await res.json();
			setData((prev) =>
				prev
					? {
							...prev,
							blacklist: [entry, ...prev.blacklist],
					  }
					: prev
			);
			showSuccess("Арендатор добавлен в черный список");
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Не удалось добавить арендатора";
			showError(message);
		} finally {
			setProcessingBlacklist(null);
		}
	};

	const handleRemoveFromBlacklist = async (entry: DashboardBlacklistItem) => {
		if (!window.confirm(`Удалить арендатора "${entry.renterName}" из черного списка?`)) {
			return;
		}
		try {
			setProcessingBlacklist(entry.id);
			const res = await fetch("/api/owner/blacklist", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: entry.id }),
			});
			if (!res.ok) {
				throw new Error("Ошибка сервера");
			}
			setData((prev) =>
				prev
					? {
							...prev,
							blacklist: prev.blacklist.filter((item) => item.id !== entry.id),
					  }
					: prev
			);
			showSuccess("Запись удалена");
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Не удалось удалить арендатора";
			showError(message);
		} finally {
			setProcessingBlacklist(null);
		}
	};

	const handleDepositAction = async (
		action: "hold" | "release" | "forfeit",
		bookingId: string
	) => {
		try {
			setProcessingDeposit(bookingId);
			let body: Record<string, unknown> | undefined;
			const parseAmount = (input: string | null | undefined) => {
				if (!input || !input.trim()) return undefined;
				const normalized = Number(input.replace(",", "."));
				if (!Number.isFinite(normalized) || normalized < 0) {
					showInfo("Введите корректную сумму в рублях");
					return null;
				}
				return Math.round(normalized * 100);
			};

			if (action === "hold") {
				const amountInput = window.prompt(
					"Укажите размер депозита (в рублях). Оставьте пустым, чтобы использовать сумму из бронирования."
				);
				const reason = window.prompt("Комментарий для блокировки (опционально)");
				const parsedAmount = parseAmount(amountInput);
				if (parsedAmount === null) {
					setProcessingDeposit(null);
					return;
				}
				body = {
					depositAmount: parsedAmount,
					reason: reason || undefined,
				};
			}
			if (action === "forfeit") {
				const amountInput = window.prompt(
					"Какую сумму удержать (в рублях)? Оставьте пустым, чтобы удержать весь депозит."
				);
				const reason = window.prompt("Укажите причину удержания (опционально)");
				const parsedAmount = parseAmount(amountInput);
				if (parsedAmount === null) {
					setProcessingDeposit(null);
					return;
				}
				body = {
					penaltyAmount: parsedAmount,
					reason: reason || undefined,
				};
			}

			const res = await fetch(`/api/owner/bookings/${bookingId}/deposit/${action}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: body ? JSON.stringify(body) : undefined,
			});
			if (!res.ok) {
				const payload = await res.json().catch(() => null);
				throw new Error(payload?.error || "Не удалось обновить депозит");
			}
			showSuccess("Статус депозита обновлен");
			await fetchDashboard();
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Ошибка при обновлении депозита";
			showError(message);
		} finally {
			setProcessingDeposit(null);
		}
	};

	return (
		<div className="container pt-14 pb-20 space-y-8">
			<header className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold text-[var(--text-primary)]">Кабинет владельца</h1>
				<p className="text-[var(--text-secondary)]">
					Следите за загрузкой мест, управляйте тарифами и реагируйте на критичные ситуации.
				</p>
			</header>

			{loading ? (
				<div className="grid gap-4">
					<div className="animate-pulse h-28 rounded-2xl bg-[var(--bg-tertiary)]" />
					<div className="animate-pulse h-28 rounded-2xl bg-[var(--bg-tertiary)]" />
					<div className="animate-pulse h-28 rounded-2xl bg-[var(--bg-tertiary)]" />
				</div>
			) : error ? (
				<MotionCard className="text-center">
					<CardHeader
						title="Не удалось загрузить данные"
						subtitle="Попробуйте обновить страницу или зайти позже"
						icon="⚠️"
					/>
					<CardContent>
						<p className="text-[var(--text-secondary)]">{error}</p>
					</CardContent>
				</MotionCard>
			) : data ? (
				<>
					<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
						<StatCard
							title="Доход за подтвержденные брони"
							value={formatCurrency(data.stats.totalEarnings)}
							icon="💰"
						/>
						<StatCard
							title="Активных броней"
							value={data.stats.upcomingBookings}
							icon="📅"
						/>
						<StatCard
							title="Загрузка мест"
							value={`${data.stats.occupancyRate}%`}
							icon="📈"
						/>
						<StatCard title="Активных мест" value={data.stats.activeSpots} icon="🅿️" />
						<StatCard
							title="Заблокировано депозитов"
							value={formatCurrency(data.stats.depositHeld)}
							icon="🛡️"
						/>
						<StatCard
							title="Возвращено депозитов"
							value={formatCurrency(data.stats.depositReleased)}
							icon="💸"
						/>
						<StatCard title="Открытых конфликтов" value={data.stats.conflicts} icon="⚠️" />
					</section>

					<section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
						<MotionCard className="order-1 xl:order-none">
							<CardHeader
								title="Календарь доступности"
								subtitle="Ближайшие брони и статусы по каждому дню"
								icon="🗓️"
							/>
							<CardContent className="space-y-3">
								{groupedCalendar.length === 0 ? (
									<p className="text-[var(--text-secondary)]">Пока нет активных броней в выбранном периоде.</p>
								) : (
									groupedCalendar.map(([dateKey, items]) => (
										<div key={dateKey} className="rounded-xl border border-[var(--border-primary)] p-4 bg-[var(--bg-secondary)]">
											<div className="flex items-center justify-between mb-3">
												<span className="text-lg font-semibold text-[var(--text-primary)]">
													{format(parseISO(items[0].startAt), "d MMMM, EEEE", { locale: ru })}
												</span>
												<Badge variant="info" size="sm">
													{items.length} брон{items.length === 1 ? "ь" : items.length < 5 ? "и" : "ей"}
												</Badge>
											</div>
											<ul className="space-y-3">
												{items.map((booking) => (
													<li key={booking.id} className="rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] p-3">
														<div className="flex flex-wrap items-center justify-between gap-2">
															<div className="flex flex-col">
																<span className="font-medium text-[var(--text-primary)]">
																	{booking.spotTitle}
																</span>
																<span className="text-xs text-[var(--text-secondary)]">
																	{format(parseISO(booking.startAt), "HH:mm", { locale: ru })} —{" "}
																	{format(parseISO(booking.endAt), "HH:mm", { locale: ru })}
																</span>
															</div>
															<Badge variant={STATUS_VARIANTS[booking.status]?.variant ?? "default"} size="sm">
																{STATUS_VARIANTS[booking.status]?.label ?? booking.status}
															</Badge>
														</div>
														<p className="text-sm text-[var(--text-secondary)] mt-2">
															Арендатор: {booking.renterName}
														</p>
													</li>
												))}
											</ul>
										</div>
									))
								)}
							</CardContent>
						</MotionCard>

						<MotionCard className="order-2 xl:order-none">
							<CardHeader
								title="Статистика доходов"
								subtitle="Показываем подтвержденные и оплаченные брони"
								icon="📊"
							/>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-[var(--text-secondary)]">Доход за подтвержденные брони</span>
									<span className="text-lg font-semibold text-[var(--text-primary)]">
										{formatCurrency(data.stats.totalEarnings)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-[var(--text-secondary)]">Количество активных броней</span>
									<span className="text-lg font-semibold text-[var(--text-primary)]">
										{data.stats.upcomingBookings}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-[var(--text-secondary)]">Средняя загрузка</span>
									<Badge variant={data.stats.occupancyRate > 60 ? "success" : data.stats.occupancyRate > 30 ? "warning" : "info"}>
										{data.stats.occupancyRate}%
									</Badge>
								</div>
							</CardContent>
						</MotionCard>
					</section>

					<section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
						<MotionCard>
							<CardHeader
								title="Управление тарифами"
								subtitle="Изменяйте стоимость почасовой аренды для каждого места"
								icon="💸"
							/>
							<CardContent className="space-y-4">
								{data.spots.length === 0 ? (
									<p className="text-[var(--text-secondary)]">
										У вас пока нет активных мест. Добавьте место, чтобы управлять тарифами.
									</p>
								) : (
									<ul className="space-y-4">
										{data.spots.map((spot) => (
											<li
												key={spot.id}
												className="rounded-xl border border-[var(--border-primary)] p-4 bg-[var(--bg-secondary)]"
											>
												<div className="flex flex-wrap items-center justify-between gap-3">
													<div>
														<h3 className="text-lg font-semibold text-[var(--text-primary)]">
															{spot.title}
														</h3>
														<p className="text-sm text-[var(--text-secondary)]">{spot.address}</p>
													</div>
													{(() => {
														const config = SPOT_STATUS_VARIANTS[spot.status] ?? {
															label: spot.status,
															variant: "default" as const,
														};
														return (
															<Badge variant={config.variant} size="sm">
																{config.label}
															</Badge>
														);
													})()}
												</div>
												<div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
													<Input
														type="number"
														value={priceDrafts[spot.id] ?? ""}
														onChange={(event) => handlePriceChange(spot.id, event.target.value)}
														min={100}
														className="sm:max-w-[160px]"
														label="Стоимость в час, ₽"
													/>
													<Button
														variant="primary"
														size="sm"
														onClick={() => handlePriceSave(spot.id)}
														disabled={savingSpotId === spot.id}
													>
														{savingSpotId === spot.id ? "Сохранение..." : "Сохранить"}
													</Button>
												</div>
											</li>
										))}
									</ul>
								)}
							</CardContent>
						</MotionCard>

						<MotionCard>
							<CardHeader
								title="Черный список"
								subtitle="Арендаторы, которым ограничен доступ к вашим местам"
								icon="⛔"
							/>
							<CardContent className="space-y-4">
								{data.blacklist.length === 0 ? (
									<p className="text-[var(--text-secondary)]">
										Черный список пуст. Вы можете добавить арендатора из блока “Экстренные действия”.
									</p>
								) : (
									<ul className="space-y-3">
										{data.blacklist.map((entry) => (
											<li
												key={entry.id}
												className="rounded-xl border border-[var(--border-primary)] p-3 bg-[var(--bg-secondary)]"
											>
												<div className="flex flex-wrap justify-between gap-3">
													<div>
														<p className="font-medium text-[var(--text-primary)]">{entry.renterName}</p>
														<p className="text-xs text-[var(--text-secondary)]">
															{format(parseISO(entry.createdAt), "d MMMM yyyy", { locale: ru })}
														</p>
														<p className="text-sm text-[var(--text-secondary)] mt-1">
															Причина: {entry.reason}
														</p>
													</div>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleRemoveFromBlacklist(entry)}
														disabled={processingBlacklist === entry.id}
													>
														{processingBlacklist === entry.id ? "Удаление..." : "Удалить"}
													</Button>
												</div>
											</li>
										))}
									</ul>
								)}
							</CardContent>
						</MotionCard>
					</section>

					<section>
						<MotionCard>
							<CardHeader
								title="Конфликты и депозиты"
								subtitle="Контролируйте страховые депозиты и спорные ситуации"
								icon="🛡️"
							/>
							<CardContent className="space-y-4">
								{data.conflicts.length === 0 ? (
									<p className="text-[var(--text-secondary)]">
										Активных конфликтов нет. Все депозиты возвращены арендаторам.
									</p>
								) : (
									<ul className="space-y-4">
										{data.conflicts.map((conflict) => {
											const depositMeta = DEPOSIT_STATUS_VARIANTS[conflict.depositStatus] ?? DEPOSIT_STATUS_VARIANTS.DEFAULT;
											const canHold =
												conflict.depositStatus === "NOT_REQUIRED" ||
												conflict.depositStatus === "PENDING" ||
												conflict.depositStatus === "RELEASED";
											const canRelease =
												conflict.depositStatus === "HELD" ||
												conflict.depositStatus === "PARTIALLY_RELEASED" ||
												conflict.depositStatus === "PENDING";
											const canForfeit =
												conflict.depositStatus === "HELD" ||
												conflict.depositStatus === "PARTIALLY_RELEASED" ||
												conflict.depositStatus === "PENDING";
											return (
												<li
													key={conflict.id}
													className="rounded-xl border border-[var(--border-primary)] p-4 bg-[var(--bg-secondary)]"
												>
													<div className="flex flex-wrap justify-between gap-3">
														<div>
															<p className="text-lg font-semibold text-[var(--text-primary)]">
																{conflict.spotTitle}
															</p>
															<p className="text-sm text-[var(--text-secondary)]">
																Арендатор: {conflict.renterName}
															</p>
															<p className="text-sm text-[var(--text-secondary)]">
																Депозит: {formatCurrency(conflict.depositAmount)}
															</p>
															{conflict.penaltyAmount > 0 && (
																<p className="text-sm text-[var(--accent-warning)]">
																	План удержания: {formatCurrency(conflict.penaltyAmount)} —{" "}
																	{conflict.penaltyReason || "Без комментария"}
																</p>
															)}
															{conflict.disputeOpenedAt && (
																<p className="text-xs text-[var(--text-muted)] mt-2">
																	Конфликт открыт{" "}
																	{format(parseISO(conflict.disputeOpenedAt), "d MMMM yyyy HH:mm", {
																		locale: ru,
																	})}
																	{conflict.disputeResolvedAt
																		? `, завершён ${format(parseISO(conflict.disputeResolvedAt), "d MMMM yyyy HH:mm", {
																				locale: ru,
																		  })}`
																		: ""}
																</p>
															)}
														</div>
														<Badge variant={depositMeta.variant}>
															{depositMeta.label}
														</Badge>
													</div>

													{conflict.transactions.length > 0 && (
														<div className="mt-4 border-t border-[var(--border-primary)] pt-3 space-y-2">
															<p className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wide">
																История операций
															</p>
															<ul className="space-y-1">
																{conflict.transactions.slice(0, 4).map((tx) => (
																	<li
																		key={tx.id}
																		className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--text-secondary)]"
																	>
																		<span>
																			{format(parseISO(tx.createdAt), "d MMM HH:mm", { locale: ru })} ·{" "}
																			{tx.type}
																			{tx.description ? ` — ${tx.description}` : ""}
																		</span>
																		<span className="font-medium text-[var(--text-primary)]">
																			{formatCurrency(tx.amount)}
																		</span>
																	</li>
																))}
															</ul>
														</div>
													)}

													<div className="flex flex-wrap items-center justify-end gap-2 mt-4">
														<Button
															variant="ghost"
															size="sm"
															icon="🛑"
															onClick={() => handleDepositAction("hold", conflict.id)}
															disabled={!canHold || processingDeposit === conflict.id}
														>
															{processingDeposit === conflict.id ? "Обновление..." : "Блокировать"}
														</Button>
														<Button
															variant="outline"
															size="sm"
															icon="♻️"
															onClick={() => handleDepositAction("release", conflict.id)}
															disabled={!canRelease || processingDeposit === conflict.id}
														>
															Возврат
														</Button>
														<Button
															variant="primary"
															size="sm"
															icon="⚡"
															onClick={() => handleDepositAction("forfeit", conflict.id)}
															disabled={!canForfeit || processingDeposit === conflict.id}
														>
															Удержать
														</Button>
													</div>
												</li>
											);
										})}
									</ul>
								)}
							</CardContent>
						</MotionCard>
					</section>

					<section>
						<MotionCard>
							<CardHeader
								title="Экстренные действия"
								subtitle="Отслеживайте отмены и просроченные брони, быстро реагируйте на проблемных арендаторов"
								icon="🚨"
							/>
							<CardContent className="space-y-4">
								{data.emergency.length === 0 ? (
									<p className="text-[var(--text-secondary)]">
										Пока что проблемных броней нет. Все в порядке!
									</p>
								) : (
									<ul className="space-y-3">
										{data.emergency.map((booking) => (
											<li
												key={booking.id}
												className="rounded-xl border border-[var(--border-primary)] p-4 bg-[var(--bg-secondary)]"
											>
												<div className="flex flex-wrap justify-between gap-3">
													<div className="space-y-1">
														<p className="text-lg font-semibold text-[var(--text-primary)]">
															{booking.spotTitle}
														</p>
														<p className="text-sm text-[var(--text-secondary)]">
															{format(parseISO(booking.startAt), "d MMMM HH:mm", { locale: ru })} —{" "}
															{format(parseISO(booking.endAt), "d MMMM HH:mm", { locale: ru })}
														</p>
														<p className="text-sm text-[var(--text-secondary)]">
															Арендатор: {booking.renterName}
														</p>
														<p className="text-sm text-[var(--text-secondary)]">
															Потенциальный доход: {formatCurrency(booking.ownerAmount)}
														</p>
													</div>
													<div className="flex flex-col gap-2 items-end">
														<Badge
															variant={STATUS_VARIANTS[booking.status]?.variant ?? "default"}
															size="sm"
														>
															{STATUS_VARIANTS[booking.status]?.label ?? booking.status}
														</Badge>
														<Button
															variant="ghost"
															size="sm"
															onClick={() => handleAddToBlacklist(booking)}
															disabled={processingBlacklist === booking.renterId}
														>
															{processingBlacklist === booking.renterId ? "Добавление..." : "В черный список"}
														</Button>
													</div>
												</div>
											</li>
										))}
									</ul>
								)}
							</CardContent>
						</MotionCard>
					</section>
				</>
			) : null}
		</div>
	);
}

