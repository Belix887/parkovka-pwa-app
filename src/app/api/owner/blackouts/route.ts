import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blackoutCreateSchema } from "@/lib/validation";

export async function POST(req: Request) {
	const body = await req.json();
	const parsed = blackoutCreateSchema.safeParse(body);
	if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });

	const created = await prisma.bookingBlock.create({
		data: {
			spotId: parsed.data.spotId,
			from: new Date(parsed.data.from),
			to: new Date(parsed.data.to),
			reason: parsed.data.reason,
		},
	});

	return NextResponse.json(created);
}


