import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const statusSchema = z.object({
	status: z
		.enum(["IN_REVIEW", "APPROVED", "REJECTED", "NEEDS_MORE_INFO"])
		.optional(),
	reviewerNotes: z.string().max(500).optional(),
	documents: z
		.array(
			z.object({
				id: z.string().min(1),
				status: z.enum(["UPLOADED", "ACCEPTED", "REJECTED"]),
			})
		)
		.optional(),
});

export async function PATCH(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "ADMIN") {
			return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
		}

		const body = await request.json();
		const parsed = statusSchema.safeParse(body);
		if (!parsed.success) {
			return NextResponse.json(
				{ error: "Некорректные данные", details: parsed.error.flatten() },
				{ status: 400 }
			);
		}

		const payload = parsed.data;
		const updates: Record<string, unknown> = {};

		if (payload.status) {
			updates.status = payload.status;
			if (payload.status === "APPROVED" || payload.status === "REJECTED") {
				updates.reviewedAt = new Date();
			}
		}
		if (payload.reviewerNotes !== undefined) {
			updates.reviewerNotes = payload.reviewerNotes;
		}
		updates.reviewerId = user.id;

		const updated = await prisma.ownerVerification.update({
			where: { id: params.id },
			data: updates,
		});

		if (payload.documents?.length) {
			for (const doc of payload.documents) {
				await prisma.verificationDocument.update({
					where: { id: doc.id },
					data: {
						status: doc.status,
						reviewerId: user.id,
						reviewedAt: new Date(),
					},
				});
			}
		}

		const documents = await prisma.verificationDocument.findMany({
			where: { verificationId: params.id },
		});

		return NextResponse.json({
			verification: {
				...updated,
				documents,
			},
		});
	} catch (error: unknown) {
		console.error("[admin owner verifications] update error", error);
		return NextResponse.json(
			{ error: "Не удалось обновить заявку" },
			{ status: 500 }
		);
	}
}

