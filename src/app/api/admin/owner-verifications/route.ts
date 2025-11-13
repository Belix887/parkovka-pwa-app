import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
	try {
		const user = await getCurrentUser();
		if (!user || user.role !== "ADMIN") {
			return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
		}

		const url = new URL(request.url);
		const status = url.searchParams.get("status");
		const takeParam = url.searchParams.get("take");
		const take = takeParam ? Math.min(Number(takeParam) || 20, 100) : 20;

		const verifications = await prisma.ownerVerification.findMany({
			where: status ? { status } : undefined,
			orderBy: { createdAt: "desc" } as any,
		});

		const slice = verifications.slice(0, take);

		const enriched = await Promise.all(
			slice.map(async (verification) => {
				const documents = await prisma.verificationDocument.findMany({
					where: { verificationId: verification.id },
				});
				const owner = await prisma.user.findUnique({
					where: { id: verification.ownerId },
				});
				return {
					...verification,
					documents,
					owner: owner
						? {
								id: owner.id,
								email: owner.email,
								name: owner.name,
						  }
						: null,
				};
			})
		);

		return NextResponse.json({ items: enriched });
	} catch (error: unknown) {
		console.error("[admin owner verifications] list error", error);
		return NextResponse.json(
			{ error: "Не удалось загрузить список" },
			{ status: 500 }
		);
	}
}

