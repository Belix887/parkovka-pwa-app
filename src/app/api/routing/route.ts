import { NextResponse } from "next/server";
import { calculateRoute, type RoutePoint } from "@/lib/routing";
import { z } from "zod";

const routeRequestSchema = z.object({
  fromLat: z.number().min(-90).max(90),
  fromLng: z.number().min(-180).max(180),
  toLat: z.number().min(-90).max(90),
  toLng: z.number().min(-180).max(180),
  mode: z.enum(["driving", "walking", "cycling"]).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = routeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некорректные данные", details: parsed.error.errors },
        { status: 400 }
      );
    }

    const from: RoutePoint = {
      lat: parsed.data.fromLat,
      lng: parsed.data.fromLng,
    };

    const to: RoutePoint = {
      lat: parsed.data.toLat,
      lng: parsed.data.toLng,
    };

    const route = await calculateRoute(from, to, {
      mode: parsed.data.mode || "driving",
    });

    if (!route) {
      return NextResponse.json(
        { error: "Не удалось построить маршрут" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      steps: route.steps,
    });
  } catch (error) {
    console.error("Routing API error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера при построении маршрута" },
      { status: 500 }
    );
  }
}

