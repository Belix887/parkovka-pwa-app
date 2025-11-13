import { z } from "zod";
import { spotCreateSchema } from "./validation";

type SpotInput = z.infer<typeof spotCreateSchema>;

type AutoModerationStatus = "PENDING_REVIEW" | "AUTO_APPROVED" | "AUTO_REJECTED";

export type AutoModerationDecision = {
	status: AutoModerationStatus;
	decision: "AUTO_APPROVED" | "AUTO_REJECTED" | "AUTO_FLAGGED";
	score: number;
	notes: string;
	issues: string[];
};

export function autoModerateSpot(input: SpotInput): AutoModerationDecision {
	const issues: string[] = [];
	let score = 0;

	// Нормализуем цену (в копейках)
	const priceRub = input.pricePerHour / 100;
	if (priceRub < 30) {
		issues.push("Цена слишком низкая");
		score -= 30;
	} else if (priceRub > 2000) {
		issues.push("Цена слишком высокая");
		score -= 10;
	} else {
		score += 20;
	}

	// Проверяем описание
	if (input.description.length < 50) {
		issues.push("Описание должно содержать минимум 50 символов");
		score -= 15;
	} else {
		score += Math.min(20, Math.floor(input.description.length / 100) * 5);
	}

	// Проверяем наличие правил
	if (input.rules.length < 20) {
		issues.push("Укажите подробные правила использования");
		score -= 10;
	} else {
		score += 10;
	}

	// Проверяем координаты (могут быть 0/0)
	if (Math.abs(input.geoLat) < 0.0001 && Math.abs(input.geoLng) < 0.0001) {
		issues.push("Не указаны корректные координаты парковки");
		score -= 25;
	}

	// Проверяем фотографии
	if (!input.photos || input.photos.length === 0) {
		issues.push("Необходимо добавить хотя бы одну фотографию");
		score -= 25;
	} else if (input.photos.length >= 3) {
		score += 15;
	}

	const finalScore = Math.max(-100, Math.min(100, score));

	if (issues.length > 0 && finalScore < -10) {
		return {
			status: "AUTO_REJECTED",
			decision: "AUTO_REJECTED",
			score: finalScore,
			notes: "Автоматическая модерация отклонила объявление. Требуется исправить замечания.",
			issues,
		};
	}

	if (issues.length <= 1 && finalScore >= 30) {
		return {
			status: "AUTO_APPROVED",
			decision: "AUTO_APPROVED",
			score: finalScore,
			notes: "Площадка автоматически одобрена. Проверьте ещё раз перед публикацией при необходимости.",
			issues,
		};
	}

	return {
		status: "PENDING_REVIEW",
		decision: "AUTO_FLAGGED",
		score: finalScore,
		notes: "Требуется ручная проверка модератором.",
		issues,
	};
}

