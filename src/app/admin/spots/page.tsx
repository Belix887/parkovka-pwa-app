import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SpotModerationTable } from "@/components/admin/SpotModerationTable";

export default async function AdminSpotsModerationPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const spots = await prisma.parkingSpot.findMany({
    where: { status: { in: ["PENDING_VERIFICATION", "PENDING_REVIEW", "AUTO_REJECTED"] } } as any,
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      owner: true,
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      moderationLogs: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  } as any);

  const items = spots.map((spot) => ({
    id: spot.id,
    status: spot.status,
    title: spot.title,
    address: spot.address,
    createdAt: spot.createdAt,
    pricePerHour: spot.pricePerHour,
    owner: spot.owner
      ? {
          id: spot.owner.id,
          email: spot.owner.email,
          name: spot.owner.name,
        }
      : null,
    photo: spot.photos?.[0]?.url ?? null,
    moderationLogs: spot.moderationLogs ?? [],
  }));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Модерация парковочных мест</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Автоматические проверки отмечают потенциальные проблемы. Вы можете принять окончательное решение и оставить комментарий владельцу.
          </p>
        </div>
        <SpotModerationTable items={items} />
      </div>
    </div>
  );
}

