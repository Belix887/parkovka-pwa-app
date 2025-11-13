import { z } from "zod";

const urlRegex = /^https:\/\/.+/i;
const unsafeHtml = /<[^>]+>/g;

const trimmedString = (min: number, max: number, message: string) =>
	z
		.string()
		.trim()
		.min(min, { message })
		.max(max, { message })
		.refine((val) => !unsafeHtml.test(val), {
			message: "Текст не должен содержать HTML-теги",
		});

const priceSchema = z
	.coerce.number()
	.refine((val) => Number.isFinite(val), { message: "Цена должна быть числом" })
	.refine((val) => val >= 100 && val <= 500_000, {
		message: "Цена должна быть от 1 ₽ (100 коп.) до 5 000 ₽ (500 000 коп.)",
	})
	.transform((val) => Math.round(val))
	.refine((val) => val % 50 === 0, {
		message: "Цена должна быть кратна 50 копейкам",
	});

export const phoneSchema = z
	.string()
	.trim()
	.min(10, { message: "Телефон должен содержать минимум 10 символов" })
	.max(20, { message: "Телефон слишком длинный" })
	.transform((val) => val.replace(/[^\\d+]/g, ""))
	.refine((raw) => {
		const digits = raw.replace(/\D/g, "");
		if (digits.length === 11) {
			return digits.startsWith("7") || digits.startsWith("8") || digits.startsWith("9");
		}
		if (digits.length === 10) {
			return digits.startsWith("9") || digits.startsWith("8");
		}
		return false;
	}, { message: "Телефон должен содержать 10-11 цифр и начинаться с 7, 8 или 9" })
	.transform((raw) => {
		const digits = raw.replace(/\D/g, "");
		const normalized = digits.length === 11 ? digits : `7${digits}`;
		const withSeven = normalized.startsWith("8") ? `7${normalized.slice(1)}` : normalized;
		return `+${withSeven}`;
	});

const addressSchema = trimmedString(5, 300, "Адрес должен содержать от 5 до 300 символов").refine(
	(value) => /[A-Za-zА-Яа-я]/.test(value) && /\d/.test(value),
	{ message: "Адрес должен содержать улицу и номер" },
);

const descriptionSchema = trimmedString(30, 2000, "Описание должно содержать от 30 до 2000 символов");
const rulesSchema = trimmedString(10, 2000, "Правила должны содержать от 10 до 2000 символов");
const titleSchema = trimmedString(3, 120, "Название должно содержать от 3 до 120 символов");

const photoSchema = z
	.string()
	.trim()
	.url({ message: "Некорректный URL изображения" })
	.refine((url) => urlRegex.test(url), { message: "URL фотографии должен начинаться с https://" });

const coordinateSchema = z
	.coerce.number()
	.refine((val) => Number.isFinite(val), { message: "Координаты должны быть числом" })
	.refine((val) => val >= -90 && val <= 90, { message: "Некорректная широта" })
	.refine((val) => Math.abs(val) > 0.000001, { message: "Координаты не должны быть равны 0" });

const longitudeSchema = z
	.coerce.number()
	.refine((val) => Number.isFinite(val), { message: "Координаты должны быть числом" })
	.refine((val) => val >= -180 && val <= 180, { message: "Некорректная долгота" })
	.refine((val) => Math.abs(val) > 0.000001, { message: "Координаты не должны быть равны 0" });

const dimensionSchema = z
	.coerce.number()
	.refine((val) => Number.isFinite(val), { message: "Размер должен быть числом" })
	.refine((val) => val >= 1 && val <= 20, { message: "Размер должен быть от 1 до 20 метров" });

export const registerSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(8),
	name: trimmedString(1, 80, "Имя обязательно и не должно превышать 80 символов"),
	phone: phoneSchema,
});

export const loginSchema = z.object({
	email: z.string().trim().email(),
	password: z.string().min(8),
});

const spotBaseSchema = z.object({
	title: titleSchema,
	description: descriptionSchema,
	pricePerHour: priceSchema,
	sizeL: dimensionSchema,
	sizeW: dimensionSchema,
	sizeH: dimensionSchema,
	covered: z.boolean(),
	guarded: z.boolean(),
	camera: z.boolean(),
	evCharging: z.boolean(),
	disabledAccessible: z.boolean(),
	wideEntrance: z.boolean(),
	accessType: z.enum(["PRIVATE_GATE", "STREET", "GARAGE", "YARD", "OTHER"]),
	rules: rulesSchema,
	address: addressSchema,
	geoLat: coordinateSchema,
	geoLng: longitudeSchema,
	photos: z
		.array(photoSchema)
		.min(1, { message: "Добавьте хотя бы одно фото" })
		.max(10, { message: "Максимум 10 фотографий" })
		.superRefine((arr, ctx) => {
			const unique = new Set(arr);
			if (unique.size !== arr.length) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "Фотографии не должны повторяться",
				});
			}
		}),
});

export const spotCreateSchema = spotBaseSchema;

export const spotUpdateSchema = spotBaseSchema.partial();

export const bookingCreateSchema = z
	.object({
		spotId: z.string().trim().min(1, { message: "Укажите идентификатор парковки" }),
		startAt: z.string().datetime({ message: "Некорректный формат даты начала" }),
		endAt: z.string().datetime({ message: "Некорректный формат даты окончания" }),
		renterLat: z.number().min(-90).max(90).optional(),
		renterLng: z.number().min(-180).max(180).optional(),
	})
	.refine(
		({ startAt, endAt }) => {
			const start = new Date(startAt).getTime();
			const end = new Date(endAt).getTime();
			return Number.isFinite(start) && Number.isFinite(end) && end > start;
		},
		{ message: "Дата окончания должна быть позже даты начала" },
	)
	.refine(
		({ startAt }) => {
			const start = new Date(startAt);
			const now = new Date();
			return start >= now;
		},
		{ message: "Нельзя бронировать в прошлом" },
		{ path: ["startAt"] }
	)
	.refine(
		({ startAt, endAt }) => {
			const start = new Date(startAt);
			const end = new Date(endAt);
			const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
			return hours >= 1; // Минимум 1 час
		},
		{ message: "Минимальная длительность бронирования: 1 час" },
		{ path: ["endAt"] }
	);

export const blackoutCreateSchema = z.object({
	spotId: z.string().trim().min(1),
	from: z.string().datetime(),
	to: z.string().datetime(),
	reason: z
		.string()
		.trim()
		.max(200, { message: "Комментарий не должен превышать 200 символов" })
		.refine((val) => !unsafeHtml.test(val), { message: "Комментарий не должен содержать HTML" })
		.optional(),
});

export const userUpdateSchema = z.object({
	name: trimmedString(1, 80, "Имя обязательно и не должно превышать 80 символов").optional(),
	phone: phoneSchema.optional(),
});

