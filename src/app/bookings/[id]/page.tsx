"use client";

import { useState, useEffect } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import { CancelBookingModal } from "@/components/booking/CancelBookingModal";
import { RouteMap } from "@/components/booking/RouteMap";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";

interface Booking {
	id: string;
	spotId: string;
	spot: {
		id: string;
		title: string;
		address: string;
		pricePerHour: number;
		cancellationPolicy?: string;
		cancellationDeadlineHours?: number;
	};
	startAt: string;
	endAt: string;
	status: string;
	totalPrice: number;
	depositAmount: number;
	depositStatus: string;
	penaltyAmount?: number;
	penaltyReason?: string;
	renterLat?: number;
	renterLng?: number;
	routeDistance?: number;
	routeDuration?: number;
	routePolyline?: string;
	createdAt: string;
}

export default function BookingDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const [booking, setBooking] = useState<Booking | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showCancelModal, setShowCancelModal] = useState(false);
	const router = useRouter();
	const { showError } = useToast();

	useEffect(() => {
		const loadData = async () => {
			const { id } = await params;
			await loadBooking(id);
		};
		loadData();
	}, [params]);

	const loadBooking = async (bookingId: string) => {
		try {
			setLoading(true);
			const response = await fetch(`/api/bookings/${bookingId}`);
			if (!response.ok) {
				throw new Error("Не удалось загрузить бронирование");
			}
			const data = await response.json();
			setBooking(data);
		} catch (err: any) {
			setError(err.message || "Ошибка загрузки");
		} finally {
			setLoading(false);
		}
	};

	const formatPrice = (price: number) => {
		return `${(price / 100).toLocaleString("ru-RU")} ₽`;
	};

	const formatDistance = (meters?: number) => {
		if (!meters) return "—";
		if (meters < 1000) return `${Math.round(meters)} м`;
		return `${(meters / 1000).toFixed(1)} км`;
	};

	const formatDuration = (seconds?: number) => {
		if (!seconds) return "—";
		const minutes = Math.round(seconds / 60);
		if (minutes < 60) return `${minutes} мин`;
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		return `${hours} ч ${remainingMinutes} мин`;
	};

	const getStatusBadge = (status: string) => {
		const statusMap: Record<
			string,
			{
				label: string;
				variant: "success" | "warning" | "error" | "info" | "default";
			}
		> = {
			PENDING: { label: "Ожидает", variant: "warning" },
			APPROVED: { label: "Подтверждено", variant: "info" },
			PAID: { label: "Оплачено", variant: "success" },
			DECLINED: { label: "Отклонено", variant: "error" },
			CANCELLED: { label: "Отменено", variant: "default" },
		};
		const statusInfo = statusMap[status] || { label: status, variant: "default" };
		return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
	};

	const canCancel =
		booking &&
		(booking.status === "PENDING" ||
			booking.status === "APPROVED" ||
			booking.status === "PAID") &&
		new Date(booking.startAt) > new Date();

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
				<MobileNavigation />
				<div className="pt-14 md:pt-0">
					<div className="container py-12">
						<div className="flex items-center justify-center h-96">
							<LoadingSpinner size="lg" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (error || !booking) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
				<MobileNavigation />
				<div className="pt-14 md:pt-0">
					<div className="container py-12">
						<MotionCard>
							<CardContent className="p-12 text-center">
								<div className="text-6xl mb-4">❌</div>
								<h1 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
									Бронирование не найдено
								</h1>
								<p className="text-[var(--text-secondary)] mb-6">{error}</p>
								<Link href="/bookings">
									<Button variant="primary">Вернуться к списку</Button>
								</Link>
							</CardContent>
						</MotionCard>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
			<MobileNavigation />
			<div className="pt-14 md:pt-0">
				<div className="container py-6 md:py-12">
					<div className="mb-6">
						<Link href="/bookings">
							<Button variant="ghost" icon="←" size="sm">
								Назад к списку
							</Button>
						</Link>
					</div>

					<div className="grid lg:grid-cols-3 gap-6">
						{/* Основная информация */}
						<div className="lg:col-span-2 space-y-6">
							<MotionCard>
								<CardHeader
									title={booking.spot.title}
									subtitle={booking.spot.address}
									icon="🅿️"
								/>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<span className="text-sm text-[var(--text-secondary)]">
												Статус
											</span>
											{getStatusBadge(booking.status)}
										</div>

										<div className="flex items-center justify-between">
											<span className="text-sm text-[var(--text-secondary)]">
												Начало
											</span>
											<span className="font-medium text-[var(--text-primary)]">
												{format(parseISO(booking.startAt), "d MMM yyyy, HH:mm")}
											</span>
										</div>

										<div className="flex items-center justify-between">
											<span className="text-sm text-[var(--text-secondary)]">
												Окончание
											</span>
											<span className="font-medium text-[var(--text-primary)]">
												{format(parseISO(booking.endAt), "d MMM yyyy, HH:mm")}
											</span>
										</div>

										{booking.routeDistance && (
											<div className="flex items-center justify-between">
												<span className="text-sm text-[var(--text-secondary)]">
													Расстояние
												</span>
												<span className="font-medium text-[var(--text-primary)]">
													{formatDistance(booking.routeDistance)}
												</span>
											</div>
										)}

										{booking.routeDuration && (
											<div className="flex items-center justify-between">
												<span className="text-sm text-[var(--text-secondary)]">
													Время в пути
												</span>
												<span className="font-medium text-[var(--text-primary)]">
													{formatDuration(booking.routeDuration)}
												</span>
											</div>
										)}
									</div>
								</CardContent>
							</MotionCard>

							{/* Маршрут на карте */}
							{booking.renterLat &&
								booking.renterLng &&
								booking.routePolyline && (
									<MotionCard>
										<CardHeader
											title="Маршрут"
											subtitle="Путь до парковочного места"
											icon="🗺️"
										/>
										<CardContent>
											{booking.spot && (
												<RouteMap
													from={{
														lat: booking.renterLat,
														lng: booking.renterLng,
													}}
													to={{
														lat: (booking.spot as any).geoLat || 0,
														lng: (booking.spot as any).geoLng || 0,
													}}
													route={
														booking.routePolyline
															? {
																	distance: booking.routeDistance || 0,
																	duration: booking.routeDuration || 0,
																	geometry: booking.routePolyline,
																	steps: [],
																}
															: null
													}
													height="400px"
												/>
											)}
										</CardContent>
									</MotionCard>
								)}
						</div>

						{/* Боковая панель */}
						<div className="space-y-6">
							<MotionCard>
								<CardHeader title="Стоимость" icon="💰" />
								<CardContent>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-sm text-[var(--text-secondary)]">
												Стоимость
											</span>
											<span className="font-bold text-lg text-[var(--text-primary)]">
												{formatPrice(booking.totalPrice)}
											</span>
										</div>

										{booking.depositAmount > 0 && (
											<div className="flex items-center justify-between">
												<span className="text-sm text-[var(--text-secondary)]">
													Депозит
												</span>
												<span className="font-medium text-[var(--text-primary)]">
													{formatPrice(booking.depositAmount)}
												</span>
											</div>
										)}

										{booking.penaltyAmount && booking.penaltyAmount > 0 && (
											<div className="flex items-center justify-between text-red-600">
												<span className="text-sm">Штраф</span>
												<span className="font-medium">
													{formatPrice(booking.penaltyAmount)}
												</span>
											</div>
										)}

										{booking.penaltyReason && (
											<div className="pt-3 border-t border-[var(--border-primary)]">
												<p className="text-xs text-[var(--text-muted)]">
													{booking.penaltyReason}
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</MotionCard>

							{canCancel && (
								<MotionCard>
									<CardContent>
										<Button
											variant="outline"
											className="w-full"
											onClick={() => setShowCancelModal(true)}
											icon="❌"
										>
											Отменить бронирование
										</Button>
									</CardContent>
								</MotionCard>
							)}

							<MotionCard>
								<CardContent>
									<Link href={`/spots/${booking.spotId}`}>
										<Button variant="outline" className="w-full" icon="👁️">
											Посмотреть место
										</Button>
									</Link>
								</CardContent>
							</MotionCard>
						</div>
					</div>
				</div>
			</div>

			{showCancelModal && (
				<CancelBookingModal
					bookingId={booking.id}
					onCancel={() => setShowCancelModal(false)}
					onSuccess={() => {
						setShowCancelModal(false);
						router.push("/bookings");
						router.refresh();
					}}
				/>
			)}
		</div>
	);
}

