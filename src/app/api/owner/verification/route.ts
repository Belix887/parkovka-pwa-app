import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const documentTypes = [
	"IDENTITY_FRONT",
	"IDENTITY_BACK",
	"SELFIE",
	"PROOF_OF_ADDRESS",
	"OTHER",
] as const;

const submissionSchema = z.object({
	fullName: z.string().min(3).max(120),
	documentType: z.enum(documentTypes),
	documentNumber: z.string().min(4).max(64),
	issuedBy: z.string().min(2).max(120).optional(),
	issuedAt: z.string().datetime().optional(),
	documents: z
		.array(
			z.object({
				type: z.enum(documentTypes),
				url: z.string().url(),
			})
		)
		.min(1)
		.max(5),
});

export async function GET() {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
		}

		const verification = await prisma.ownerVerification.findFirst({
			where: { ownerId: user.id },
			orderBy: { createdAt: "desc" } as any,
		});

		if (!verification) {
			return NextResponse.json({ verification: null });
		}

		const documents = await prisma.verificationDocument.findMany({
			where: { verificationId: verification.id },
		});

		return NextResponse.json({
			verification: {
				...verification,
				documents,
			},
		});
	} catch (error: unknown) {
		console.error("[owner verification] get error", error);
		return NextResponse.json(
			{ error: "Не удалось загрузить данные" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const user = await getCurrentUser();
		if (!user) {
			return NextResponse.json({ error: "Не авторизовано" }, { status: 401 });
		}
		if (user.role !== "OWNER") {
			return NextResponse.json({ error: "Доступно только владельцам" }, { status: 403 });
		}

		const json = await request.json();
		const parsed = submissionSchema.safeParse(json);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Некорректные данные", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const payload = parsed.data;
		const issuedAt = payload.issuedAt ? new Date(payload.issuedAt) : null;

		const existing = await prisma.ownerVerification.findFirst({
			where: { ownerId: user.id },
			orderBy: { createdAt: "desc" } as any,
		});

		let verificationId: string;
		if (existing) {
			const updated = await prisma.ownerVerification.update({
				where: { id: existing.id },
				data: {
					fullName: payload.fullName,
					documentType: payload.documentType,
					documentNumber: payload.documentNumber,
					issuedBy: payload.issuedBy,
					issuedAt: issuedAt ?? existing.issuedAt,
					status: "PENDING",
					submittedAt: new Date(),
					reviewerId: null,
					reviewerNotes: null,
				},
			});
			verificationId = updated.id;

			await prisma.verificationDocument.deleteMany?.({
				where: { verificationId: updated.id },
			});
		} else {
			const created = await prisma.ownerVerification.create({
				data: {
					ownerId: user.id,
					fullName: payload.fullName,
					documentType: payload.documentType,
					documentNumber: payload.documentNumber,
					issuedBy: payload.issuedBy,
					issuedAt: issuedAt ?? undefined,
					status: "PENDING",
					submittedAt: new Date(),
				},
			});
			verificationId = created.id;
		}

		for (const doc of payload.documents) {
			await prisma.verificationDocument.create({
				data: {
					verificationId,
					type: doc.type,
					url: doc.url,
					status: "UPLOADED",
				},
			});
		}

		return NextResponse.json({ success: true, verificationId });
	} catch (error: unknown) {
		console.error("[owner verification] submit error", error);
		return NextResponse.json(
			{ error: "Не удалось сохранить заявку" },
			{ status: 500 }
		);
	}
}

