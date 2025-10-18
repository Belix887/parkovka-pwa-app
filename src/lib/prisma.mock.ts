type User = { id: string; email: string; passwordHash: string; role: "RENTER"|"OWNER"|"ADMIN"; name?: string; phone?: string };
type Photo = { id: string; url: string; sortOrder: number };
type Spot = {
  id: string; ownerId: string; status: "DRAFT"|"PENDING_REVIEW"|"APPROVED"|"REJECTED";
  title: string; description: string; pricePerHour: number; sizeL: number; sizeW: number; sizeH: number;
  covered: boolean; guarded: boolean; camera: boolean; evCharging: boolean; disabledAccessible: boolean; wideEntrance: boolean;
  accessType: "PRIVATE_GATE"|"STREET"|"GARAGE"|"YARD"|"OTHER"; rules: string; address: string; geoLat: number; geoLng: number;
  photos: Photo[]; createdAt: Date; updatedAt: Date;
};
type Booking = {
  id: string; spotId: string; renterId: string; startAt: Date; endAt: Date;
  status: "PENDING"|"APPROVED"|"DECLINED"|"CANCELLED"|"PAID";
  totalPrice: number; commissionPct: number; commissionAmount: number; ownerAmount: number; paymentId?: string;
  createdAt: Date; updatedAt: Date;
};
type Blackout = { id: string; spotId: string; from: Date; to: Date; reason?: string };

const users: User[] = [
  { id: "u-owner", email: "owner@example.com", passwordHash: "owner123", role: "OWNER" },
  { id: "u-renter", email: "renter@example.com", passwordHash: "renter123", role: "RENTER" },
];
const spots: Spot[] = [
  {
    id: "s-1",
    ownerId: "u-owner",
    status: "APPROVED",
    title: "Парковочное место у метро",
    description: "Удобное место рядом с метро. Двор, камера, крытое.",
    pricePerHour: 20000,
    sizeL: 5, sizeW: 2.4, sizeH: 2.2,
    covered: true, guarded: true, camera: true, evCharging: false, disabledAccessible: false, wideEntrance: true,
    accessType: "YARD",
    rules: "Без ночных сигнализаций.",
    address: "Москва, ул. Пример, 1",
    geoLat: 55.751244, geoLng: 37.618423,
    photos: [{ id: "p1", url: "https://placehold.co/1200x800", sortOrder: 0 }],
    createdAt: new Date(), updatedAt: new Date(),
  }
];
const bookings: Booking[] = [];
const blackouts: Blackout[] = [];

function cuid() { return Math.random().toString(36).slice(2); }

export const prisma = {
  user: {
    findUnique: async ({ where: { email, id } }: any) =>
      (email ? users.find(u => u.email === String(email).toLowerCase()) : users.find(u => u.id === id)) || null,
    create: async ({ data }: any) => {
      const u: User = { id: cuid(), role: "RENTER", passwordHash: "", ...data, email: String(data.email).toLowerCase() };
      users.push(u);
      return u;
    },
    upsert: async ({ where: { email }, create, update }: any) => {
      const ex = users.find(u => u.email === email);
      if (ex) { Object.assign(ex, update); return ex; }
      const u: User = { id: cuid(), role: "RENTER", passwordHash: "", ...create };
      users.push(u); return u;
    },
  },
  parkingSpot: {
    findMany: async ({ where, skip = 0, take = 20, orderBy, include }: any) => {
      let list = spots.slice();
      if (where?.status) list = list.filter(s => s.status === where.status);
      if (where?.pricePerHour?.gte != null) list = list.filter(s => s.pricePerHour >= where.pricePerHour.gte);
      if (where?.pricePerHour?.lte != null) list = list.filter(s => s.pricePerHour <= where.pricePerHour.lte);
      ["covered","guarded","camera","evCharging","disabledAccessible","wideEntrance"].forEach((k: any) => {
        if (where?.[k] !== undefined) list = list.filter((s:any) => s[k] === where[k]);
      });
      if (where?.accessType) list = list.filter(s => s.accessType === where.accessType);
      if (orderBy?.createdAt === "desc") list = list.sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime());
      const page = list.slice(skip, skip + take);
      if (include?.photos) return page.map(s => ({ ...s, photos: s.photos.slice(0, include.photos.take ?? s.photos.length) }));
      return page;
    },
    findUnique: async ({ where: { id }, include }: any) => {
      const s = spots.find(s => s.id === id) || null;
      if (!s) return null;
      if (include?.photos) return { ...s, photos: s.photos };
      return s;
    },
    create: async ({ data }: any) => {
      const s: Spot = { id: cuid(), createdAt: new Date(), updatedAt: new Date(), photos: [], ...data };
      if (data.photos?.create?.length) s.photos = data.photos.create.map((p:any, i:number) => ({ id: cuid(), url: p.url, sortOrder: p.sortOrder ?? i }));
      spots.push(s);
      return s;
    },
  },
  booking: {
    findMany: async ({ where, include }: any) => {
      let list = bookings.slice();
      if (where?.renterId) list = list.filter(b => b.renterId === where.renterId);
      if (where?.spot?.ownerId) {
        const ownerId = where.spot.ownerId;
        const spotIds = spots.filter(s => s.ownerId === ownerId).map(s => s.id);
        list = list.filter(b => spotIds.includes(b.spotId));
      }
      if (include?.spot) {
        return list.map(b => ({ ...b, spot: spots.find(s => s.id === b.spotId) || null }));
      }
      return list;
    },
    create: async ({ data }: any) => {
      const b: Booking = { id: cuid(), createdAt: new Date(), updatedAt: new Date(), ...data };
      bookings.push(b); return b;
    },
    findUnique: async ({ where: { id } }: any) => bookings.find(b => b.id === id) || null,
    update: async ({ where: { id }, data }: any) => {
      const b = bookings.find(b => b.id === id); if (!b) throw new Error("not found");
      Object.assign(b, data, { updatedAt: new Date() }); return b;
    },
  },
  bookingBlock: {
    create: async ({ data }: any) => {
      const blk: Blackout = { id: cuid(), ...data };
      blackouts.push(blk); return blk;
    }
  }
};


