export interface PricingOptions {
	commissionPct?: number;
	depositRequired?: boolean;
	depositAmount?: number;
	depositPercent?: number;
	timeOfDay?: number; // Час дня (0-23) для динамического ценообразования
	dayOfWeek?: number; // День недели (0-6) для динамического ценообразования
	demandMultiplier?: number; // Множитель спроса (0.5-2.0)
}

export interface PricingResult {
	totalPrice: number;
	commissionAmount: number;
	ownerAmount: number;
	commissionPct: number;
	depositAmount: number;
	basePrice: number;
	adjustedPrice: number; // Цена после применения динамических коэффициентов
}

/**
 * Рассчитать базовую цену
 */
export function calcPricing(
	hours: number,
	pricePerHour: number,
	commissionPct = 10,
	options: PricingOptions = {}
): PricingResult {
	const { timeOfDay, dayOfWeek, demandMultiplier = 1.0 } = options;

	// Базовая цена
	let basePrice = hours * pricePerHour;

	// Динамическое ценообразование: время суток
	let timeMultiplier = 1.0;
	if (timeOfDay !== undefined) {
		// Ночь (22:00 - 6:00) дешевле на 20%
		if (timeOfDay >= 22 || timeOfDay < 6) {
			timeMultiplier = 0.8;
		}
		// Пиковые часы (8:00 - 10:00, 17:00 - 19:00) дороже на 30%
		else if (
			(timeOfDay >= 8 && timeOfDay < 10) ||
			(timeOfDay >= 17 && timeOfDay < 19)
		) {
			timeMultiplier = 1.3;
		}
	}

	// Динамическое ценообразование: день недели
	let dayMultiplier = 1.0;
	if (dayOfWeek !== undefined) {
		// Выходные (суббота=6, воскресенье=0) дороже на 20%
		if (dayOfWeek === 0 || dayOfWeek === 6) {
			dayMultiplier = 1.2;
		}
	}

	// Применяем все множители
	const adjustedPrice = Math.round(
		basePrice * timeMultiplier * dayMultiplier * demandMultiplier
	);

	// Комиссия платформы
	const commissionAmount = Math.round((adjustedPrice * commissionPct) / 100);
	const ownerAmount = adjustedPrice - commissionAmount;

	// Расчет депозита
	let depositAmount = 0;
	if (options.depositRequired) {
		if (options.depositAmount) {
			depositAmount = options.depositAmount;
		} else if (options.depositPercent) {
			depositAmount = Math.round((adjustedPrice * options.depositPercent) / 100);
		} else {
			// Дефолтный депозит: 20% от стоимости
			depositAmount = Math.round(adjustedPrice * 0.2);
		}
	}

	return {
		totalPrice: adjustedPrice,
		commissionAmount,
		ownerAmount,
		commissionPct,
		depositAmount,
		basePrice,
		adjustedPrice,
	};
}

/**
 * Рассчитать возврат при отмене бронирования
 */
export interface RefundCalculation {
	refundAmount: number;
	depositRefund: number;
	commissionRefund: number;
	penalty: number;
	reason: string;
}

export function calculateRefund(
	booking: {
		totalPrice: number;
		depositAmount: number;
		startAt: Date;
		createdAt: Date;
	},
	cancellationPolicy: "FLEXIBLE" | "MODERATE" | "STRICT",
	cancellationDeadlineHours: number,
	cancelledAt: Date = new Date()
): RefundCalculation {
	const hoursUntilStart =
		(booking.startAt.getTime() - cancelledAt.getTime()) / (1000 * 60 * 60);
	const isBeforeDeadline = hoursUntilStart >= cancellationDeadlineHours;

	let refundPercent = 100;
	let penalty = 0;
	let reason = "";

	if (cancellationPolicy === "FLEXIBLE") {
		// Гибкая политика: полный возврат всегда
		refundPercent = 100;
		reason = "Гибкая политика отмены: полный возврат";
	} else if (cancellationPolicy === "MODERATE") {
		// Умеренная политика: полный возврат до дедлайна, 50% после
		if (isBeforeDeadline) {
			refundPercent = 100;
			reason = `Отмена за ${Math.round(hoursUntilStart)} часов до начала: полный возврат`;
		} else {
			refundPercent = 50;
			penalty = Math.round(booking.totalPrice * 0.5);
			reason = `Отмена менее чем за ${cancellationDeadlineHours} часов: возврат 50%`;
		}
	} else if (cancellationPolicy === "STRICT") {
		// Строгая политика: полный возврат до дедлайна, 0% после
		if (isBeforeDeadline) {
			refundPercent = 100;
			reason = `Отмена за ${Math.round(hoursUntilStart)} часов до начала: полный возврат`;
		} else {
			refundPercent = 0;
			penalty = booking.totalPrice;
			reason = `Отмена менее чем за ${cancellationDeadlineHours} часов: возврат невозможен`;
		}
	}

	const refundAmount = Math.round((booking.totalPrice * refundPercent) / 100);
	const depositRefund = booking.depositAmount; // Депозит всегда возвращается полностью
	const commissionRefund = Math.round(
		(booking.totalPrice * 0.1 * refundPercent) / 100
	); // 10% комиссия возвращается пропорционально

	return {
		refundAmount,
		depositRefund,
		commissionRefund,
		penalty,
		reason,
	};
}


