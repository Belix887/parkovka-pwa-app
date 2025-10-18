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
	const max = new Date(now);
	max.setMonth(max.getMonth() + 12);
	if (endAt > max) throw new Error("Нельзя бронировать более чем на 12 месяцев вперёд.");
	const hours = Math.round((endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60));
	if (hours <= 0) throw new Error("Длительность брони должна быть положительной.");
	return hours;
}


