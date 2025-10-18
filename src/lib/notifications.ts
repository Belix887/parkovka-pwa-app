export async function sendEmail(to: string, subject: string, html: string) {
	console.log("[EMAIL]", { to, subject });
}

export async function sendPush(tokens: { provider: string; token: string }[], title: string, body: string) {
	if (!tokens.length) return;
	console.log("[PUSH]", { count: tokens.length, title });
}


