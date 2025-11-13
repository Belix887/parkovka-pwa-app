"use client";

import { useState } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/ToastProvider";

interface CancelBookingModalProps {
	bookingId: string;
	onCancel: () => void;
	onSuccess: () => void;
}

export function CancelBookingModal({
	bookingId,
	onCancel,
	onSuccess,
}: CancelBookingModalProps) {
	const [reason, setReason] = useState("");
	const [loading, setLoading] = useState(false);
	const { showSuccess, showError } = useToast();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ reason: reason || undefined }),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Не удалось отменить бронирование");
			}

			const data = await response.json();
			showSuccess(
				"Бронирование отменено",
				data.refund?.reason || "Бронирование успешно отменено"
			);
			onSuccess();
		} catch (err: any) {
			showError("Ошибка отмены", err.message || "Не удалось отменить бронирование");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<MotionCard className="w-full max-w-md">
				<CardHeader
					title="Отменить бронирование"
					subtitle="Вы уверены, что хотите отменить это бронирование?"
					icon="⚠️"
				/>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
								Причина отмены (необязательно)
							</label>
							<textarea
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								placeholder="Укажите причину отмены..."
								className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-300"
								rows={3}
								maxLength={500}
							/>
						</div>

						<div className="flex gap-3">
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								disabled={loading}
								className="flex-1"
							>
								Отмена
							</Button>
							<Button
								type="submit"
								variant="primary"
								loading={loading}
								className="flex-1"
								icon="❌"
							>
								{loading ? "Отмена..." : "Отменить бронирование"}
							</Button>
						</div>
					</form>
				</CardContent>
			</MotionCard>
		</div>
	);
}

