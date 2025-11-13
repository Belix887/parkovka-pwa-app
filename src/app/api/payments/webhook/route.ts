import { NextResponse } from "next/server";

export async function POST(request: Request) {
	try {
		// Имитируем приём вебхука от платёжного провайдера
		const payload = await request.json().catch(() => null);
		console.log("[payments webhook]", payload);

		// В реальном проекте здесь будет проверка подписи и обновление статусов
		return NextResponse.json({ success: true });
	} catch (error: unknown) {
		console.error("[payments webhook] error", error);
		return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
	}
}

