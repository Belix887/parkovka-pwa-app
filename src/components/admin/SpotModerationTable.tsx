"use client";

import { useState } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface ModerationLog {
	id: string;
	decision: string;
	statusBefore: string;
	statusAfter: string;
	notes?: string | null;
	auto: boolean;
	reviewerId?: string | null;
	meta?: Record<string, unknown> | null;
	createdAt: string | Date;
}

interface SpotModerationItem {
	id: string;
	status: string;
	title: string;
	address: string;
	createdAt: string | Date;
	pricePerHour: number;
	photo?: string | null;
	owner: {
		id: string;
		email: string;
		name?: string | null;
	} | null;
	moderationLogs: ModerationLog[];
}

interface SpotModerationTableProps {
	items: SpotModerationItem[];
}

const STATUS_LABELS: Record<
	string,
	{ label: string; variant: "default" | "success" | "warning" | "error" | "info" }
> = {
	DRAFT: { label: "Черновик", variant: "default" },
	PENDING_VERIFICATION: { label: "Ожидает авто-проверки", variant: "warning" },
	PENDING_REVIEW: { label: "На модерации", variant: "warning" },
	AUTO_APPROVED: { label: "Авто одобрено", variant: "success" },
	AUTO_REJECTED: { label: "Авто отклонено", variant: "error" },
	APPROVED: { label: "Одобрено", variant: "success" },
	REJECTED: { label: "Отклонено", variant: "error" },
};

function formatCurrency(value: number) {
	return new Intl.NumberFormat("ru-RU", {
		style: "currency",
		currency: "RUB",
		maximumFractionDigits: 0,
	}).format(value / 100);
}

export function SpotModerationTable({ items: initialItems }: SpotModerationTableProps) {
	const { showError, showSuccess } = useToast();
	const [items, setItems] = useState(initialItems);
	const [processing, setProcessing] = useState<string | null>(null);

	const handleDecision = async (spotId: string, nextStatus: string) => {
		try {
			setProcessing(spotId);
			const notes =
				nextStatus === "REJECTED"
					? window.prompt("Укажите причину отказа", "Недостаточно информации")
					: undefined;

			const res = await fetch(`/api/admin/spots/${spotId}/moderation`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: nextStatus, notes: notes || undefined }),
			});
			if (!res.ok) {
				const payload = await res.json().catch(() => null);
				throw new Error(payload?.error || "Не удалось обновить статус");
			}
			const payload = await res.json();
			setItems((prev) =>
				prev.map((item) =>
					item.id === spotId
						? {
								...item,
								status: payload.status,
								moderationLogs: [
									{
										id: crypto.randomUUID(),
										decision:
											payload.status === "APPROVED" ? "MANUAL_APPROVED" : "MANUAL_REJECTED",
										statusBefore: item.status,
										statusAfter: payload.status,
										notes: notes || undefined,
										auto: false,
										createdAt: new Date().toISOString(),
									},
									...item.moderationLogs,
								].slice(0, 5),
						  }
						: item
				)
			);
			showSuccess("Статус места обновлен");
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Ошибка при обновлении";
			showError(message);
		} finally {
			setProcessing(null);
		}
	};

	if (items.length === 0) {
		return (
			<MotionCard>
				<CardHeader
					title="Нет заявок на модерацию"
					subtitle="Все места прошли проверку"
					icon="✅"
				/>
			</MotionCard>
		);
	}

	return (
		<div className="space-y-4">
			{items.map((item) => {
				const statusConfig = STATUS_LABELS[item.status] ?? STATUS_LABELS.DRAFT;
				return (
					<MotionCard key={item.id}>
						<CardHeader
							title={item.title}
							subtitle={item.address}
							icon="🅿️"
						/>
						<CardContent className="space-y-3">
							<div className="flex flex-wrap items-center justify-between gap-3">
								<Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
								<div className="text-sm text-[var(--text-secondary)]">
									Добавлено{" "}
									{format(new Date(item.createdAt), "d MMMM yyyy, HH:mm", { locale: ru })}
								</div>
							</div>
							<div className="grid md:grid-cols-2 gap-3">
								<div className="space-y-1 text-sm text-[var(--text-secondary)]">
									<p>
										Цена за час:{" "}
										<span className="text-[var(--text-primary)] font-semibold">
											{formatCurrency(item.pricePerHour)}
										</span>
									</p>
									{item.owner && (
										<p>
											Владелец: {item.owner.name || "—"} ({item.owner.email})
										</p>
									)}
								</div>
								{item.photo && (
									<img
										src={item.photo}
										alt={item.title}
										className="rounded-xl object-cover w-full h-40 border border-[var(--border-primary)]"
									/>
								)}
							</div>

							{item.moderationLogs.length > 0 && (
								<div className="border-t border-[var(--border-primary)] pt-3">
									<p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">
										История модерации
									</p>
									<ul className="space-y-1">
										{item.moderationLogs.slice(0, 5).map((log) => (
											<li key={log.id} className="text-xs text-[var(--text-secondary)]">
												{format(new Date(log.createdAt), "d MMM HH:mm", { locale: ru })} ·{" "}
												{log.decision} → {log.statusAfter}
												{log.notes ? ` — ${log.notes}` : ""}
											</li>
										))}
									</ul>
								</div>
							)}

							<div className="flex flex-wrap justify-end gap-2">
								<Button
									variant="outline"
									size="sm"
									icon="📝"
									onClick={() => handleDecision(item.id, "PENDING_REVIEW")}
									disabled={processing === item.id}
								>
									На доработку
								</Button>
								<Button
									variant="ghost"
									size="sm"
									icon="⛔"
									onClick={() => handleDecision(item.id, "REJECTED")}
									disabled={processing === item.id}
								>
									Отклонить
								</Button>
								<Button
									variant="primary"
									size="sm"
									icon="✅"
									onClick={() => handleDecision(item.id, "APPROVED")}
									disabled={processing === item.id}
								>
									Одобрить
								</Button>
							</div>
						</CardContent>
					</MotionCard>
				);
			})}
		</div>
	);
}

