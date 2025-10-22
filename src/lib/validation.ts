import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(1).max(80),
	phone: z
		.string()
		.min(5)
		.max(20)
		.refine((val) => {
			const digits = val.replace(/\D/g, "");
			// Принимаем телефоны с 10-11 цифрами, начинающиеся с 7, 8 или 9
			if (digits.length < 10 || digits.length > 11) return false;
			return digits.startsWith("7") || digits.startsWith("8") || digits.startsWith("9");
		}, {
			message: "Телефон должен содержать 10-11 цифр и начинаться с 7, 8 или 9",
		}),
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const spotCreateSchema = z.object({
	title: z.string().min(3).max(120),
	description: z.string().min(10).max(2000),
	pricePerHour: z.number().int().positive(),
	sizeL: z.number().positive(),
	sizeW: z.number().positive(),
	sizeH: z.number().positive(),
	covered: z.boolean(),
	guarded: z.boolean(),
	camera: z.boolean(),
	evCharging: z.boolean(),
	disabledAccessible: z.boolean(),
	wideEntrance: z.boolean(),
	accessType: z.enum(["PRIVATE_GATE", "STREET", "GARAGE", "YARD", "OTHER"]),
	rules: z.string().min(3).max(2000),
	address: z.string().min(3).max(300),
	geoLat: z.number().min(-90).max(90),
	geoLng: z.number().min(-180).max(180),
	photos: z.array(z.string().url()).min(1).max(10),
});

export const spotUpdateSchema = spotCreateSchema.partial();

export const bookingCreateSchema = z.object({
	spotId: z.string().min(1),
	startAt: z.string().datetime(),
	endAt: z.string().datetime(),
});

export const blackoutCreateSchema = z.object({
	spotId: z.string().min(1),
	from: z.string().datetime(),
	to: z.string().datetime(),
	reason: z.string().max(200).optional(),
});

export const userUpdateSchema = z.object({
	name: z.string().min(1).max(80).optional(),
	phone: z
		.string()
		.min(5)
		.max(20)
		.refine((val) => {
			const digits = val.replace(/\D/g, "");
			// Принимаем телефоны с 10-11 цифрами, начинающиеся с 7, 8 или 9
			if (digits.length < 10 || digits.length > 11) return false;
			return digits.startsWith("7") || digits.startsWith("8") || digits.startsWith("9");
		}, {
			message: "Телефон должен содержать 10-11 цифр и начинаться с 7, 8 или 9",
		}).optional(),
});


