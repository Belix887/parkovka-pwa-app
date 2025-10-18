export function calcPricing(hours: number, pricePerHour: number, commissionPct = 10) {
	const totalPrice = hours * pricePerHour;
	const commissionAmount = Math.round((totalPrice * commissionPct) / 100);
	const ownerAmount = totalPrice - commissionAmount;
	return { totalPrice, commissionAmount, ownerAmount, commissionPct };
}


