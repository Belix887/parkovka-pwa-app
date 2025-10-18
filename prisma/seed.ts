import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  // Seed passwords
  const ownerPassword = "owner123";
  const renterPassword = "renter123";
  const ownerHash = await hash(ownerPassword, 10);
  const renterHash = await hash(renterPassword, 10);

  // Create owner and renter
  const owner = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: { email: "owner@example.com", passwordHash: ownerHash, role: "OWNER" },
  });
  const renter = await prisma.user.upsert({
    where: { email: "renter@example.com" },
    update: {},
    create: { email: "renter@example.com", passwordHash: renterHash, role: "RENTER" },
  });

  await prisma.parkingSpot.create({
    data: {
      ownerId: owner.id,
      status: "APPROVED",
      title: "Парковочное место у метро",
      description: "Удобное место рядом с метро. Двор, камера, крытое.",
      pricePerHour: 20000,
      sizeL: 5,
      sizeW: 2.4,
      sizeH: 2.2,
      covered: true,
      guarded: true,
      camera: true,
      evCharging: false,
      disabledAccessible: false,
      wideEntrance: true,
      accessType: "YARD",
      rules: "Без ночных сигнализаций.",
      address: "Москва, ул. Пример, 1",
      geoLat: 55.751244,
      geoLng: 37.618423,
      photos: { create: [{ url: "https://placehold.co/1200x800", sortOrder: 0 }] },
    },
  });

  console.log({ owner: owner.email, renter: renter.email });
  console.log("Seeded users:");
  console.log("  owner@example.com /", ownerPassword);
  console.log("  renter@example.com /", renterPassword);
}

main().finally(async () => {
  await prisma.$disconnect();
});


