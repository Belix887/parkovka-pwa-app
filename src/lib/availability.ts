const MIN_BOOKING_HOURS = 1; // Минимальная длительность бронирования (часы)
const MAX_BOOKING_HOURS = 24 * 30; // Максимальная длительность (30 дней)
const MIN_ADVANCE_HOURS = 0; // Минимальное время до начала (0 = можно сейчас)
const MAX_ADVANCE_MONTHS = 12; // Максимальное время вперед (месяцы)

export function isHourAligned(date: Date) {
	return (
		date.getUTCMinutes() === 0 &&
		date.getUTCSeconds() === 0 &&
		date.getUTCMilliseconds() === 0
	);
}

export function validateBookingWindow(startAt: Date, endAt: Date) {
	if (!isHourAligned(startAt) || !isHourAligned(endAt)) {
		throw new Error("Интервалы должны начинаться и заканчиваться на границе часа.");
	}
	if (!(startAt < endAt)) throw new Error("Неверный интервал.");
	
	const now = new Date();
	
	// Проверка минимального времени до начала
	const minStartTime = new Date(now.getTime() + MIN_ADVANCE_HOURS * 60 * 60 * 1000);
	if (startAt < minStartTime) {
		throw new Error(`Бронирование должно начинаться не раньше чем через ${MIN_ADVANCE_HOURS} часов.`);
	}
	
	// Проверка максимального времени вперед
	const max = new Date(now);
	max.setMonth(max.getMonth() + MAX_ADVANCE_MONTHS);
	if (endAt > max) {
		throw new Error(`Нельзя бронировать более чем на ${MAX_ADVANCE_MONTHS} месяцев вперёд.`);
	}
	
	// Проверка минимальной длительности
	const hours = Math.round((endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60));
	if (hours < MIN_BOOKING_HOURS) {
		throw new Error(`Минимальная длительность бронирования: ${MIN_BOOKING_HOURS} час(а).`);
	}
	
	// Проверка максимальной длительности
	if (hours > MAX_BOOKING_HOURS) {
		throw new Error(`Максимальная длительность бронирования: ${MAX_BOOKING_HOURS / 24} дней.`);
	}
	
	return hours;
}

/**
 * Проверить доступность парковочного места на указанный интервал
 */
export async function checkSpotAvailability(
	spotId: string,
	startAt: Date,
	endAt: Date,
	prisma: any
): Promise<{ available: boolean; conflicts: any[] }> {
	// Проверяем существующие бронирования
	const existingBookings = await prisma.booking.findMany({
		where: {
			spotId,
			status: { in: ["PENDING", "APPROVED", "PAID"] },
			OR: [
				// Перекрытие: начало нового бронирования внутри существующего
				{ startAt: { lte: startAt }, endAt: { gt: startAt } },
				// Перекрытие: конец нового бронирования внутри существующего
				{ startAt: { lt: endAt }, endAt: { gte: endAt } },
				// Перекрытие: новое бронирование полностью содержит существующее
				{ startAt: { gte: startAt }, endAt: { lte: endAt } },
			],
		},
	});

	// Проверяем блокировки владельца (blackouts)
	const blackouts = await prisma.bookingBlock.findMany({
		where: {
			spotId,
			OR: [
				{ from: { lte: startAt }, to: { gt: startAt } },
				{ from: { lt: endAt }, to: { gte: endAt } },
				{ from: { gte: startAt }, to: { lte: endAt } },
			],
		},
	});

	const conflicts = [...existingBookings, ...blackouts];

	return {
		available: conflicts.length === 0,
		conflicts,
	};
}

/**
 * Получить доступные временные слоты для парковочного места на указанную дату
 */
export async function getAvailableSlots(
	spotId: string,
	date: Date,
	prisma: any
): Promise<Array<{ start: Date; end: Date }>> {
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	// Получаем все бронирования на этот день
	const bookings = await prisma.booking.findMany({
		where: {
			spotId,
			status: { in: ["PENDING", "APPROVED", "PAID"] },
			OR: [
				{ startAt: { lte: endOfDay }, endAt: { gte: startOfDay } },
			],
		},
		orderBy: { startAt: "asc" },
	});

	// Получаем блокировки
	const blackouts = await prisma.bookingBlock.findMany({
		where: {
			spotId,
			OR: [
				{ from: { lte: endOfDay }, to: { gte: startOfDay } },
			],
		},
		orderBy: { from: "asc" },
	});

	// Объединяем все занятые интервалы
	const occupied: Array<{ start: Date; end: Date }> = [
		...bookings.map((b: any) => ({ start: new Date(b.startAt), end: new Date(b.endAt) })),
		...blackouts.map((b: any) => ({ start: new Date(b.from), end: new Date(b.to) })),
	].sort((a, b) => a.start.getTime() - b.start.getTime());

	// Находим свободные слоты
	const availableSlots: Array<{ start: Date; end: Date }> = [];
	let currentTime = new Date(startOfDay);

	for (const occupiedSlot of occupied) {
		if (currentTime < occupiedSlot.start) {
			// Есть свободный интервал
			availableSlots.push({
				start: new Date(currentTime),
				end: new Date(occupiedSlot.start),
			});
		}
		currentTime = new Date(Math.max(currentTime.getTime(), occupiedSlot.end.getTime()));
	}

	// Проверяем, есть ли свободное время до конца дня
	if (currentTime < endOfDay) {
		availableSlots.push({
			start: new Date(currentTime),
			end: new Date(endOfDay),
		});
	}

	return availableSlots.filter(
		(slot) => (slot.end.getTime() - slot.start.getTime()) >= MIN_BOOKING_HOURS * 60 * 60 * 1000
	);
}


