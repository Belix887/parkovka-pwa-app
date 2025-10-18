import { NextResponse } from "next/server";

export async function POST() {
	return NextResponse.json({ url: "https://placehold.co/1200x800" });
}


