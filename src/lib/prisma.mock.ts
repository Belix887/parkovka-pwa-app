type User = { id: string; email: string; passwordHash: string; role: "RENTER"|"OWNER"|"ADMIN"; name?: string; phone?: string };
type Photo = { id: string; url: string; sortOrder: number };
type Spot = {
  id: string; ownerId: string; status: "DRAFT"|"PENDING_VERIFICATION"|"PENDING_REVIEW"|"AUTO_APPROVED"|"AUTO_REJECTED"|"APPROVED"|"REJECTED";
  title: string; description: string; pricePerHour: number; sizeL: number; sizeW: number; sizeH: number;
  covered: boolean; guarded: boolean; camera: boolean; evCharging: boolean; disabledAccessible: boolean; wideEntrance: boolean;
  accessType: "PRIVATE_GATE"|"STREET"|"GARAGE"|"YARD"|"OTHER"; rules: string; address: string; geoLat: number; geoLng: number;
  photos: Photo[]; createdAt: Date; updatedAt: Date;
};
type Booking = {
  id: string; spotId: string; renterId: string; startAt: Date; endAt: Date;
  status: "PENDING"|"APPROVED"|"DECLINED"|"CANCELLED"|"PAID";
  totalPrice: number; commissionPct: number; commissionAmount: number; ownerAmount: number; paymentId?: string;
  depositAmount: number; depositStatus: "NOT_REQUIRED"|"PENDING"|"HELD"|"PARTIALLY_RELEASED"|"RELEASED"|"FORFEITED"|"FAILED";
  penaltyAmount: number; penaltyReason?: string; disputeOpenedAt?: Date|null; disputeResolvedAt?: Date|null;
  createdAt: Date; updatedAt: Date;
};
type Blackout = { id: string; spotId: string; from: Date; to: Date; reason?: string };
type BlacklistEntry = { id: string; ownerId: string; renterId: string; reason?: string; createdAt: Date };
type OwnerVerification = {
  id: string;
  ownerId: string;
  status: "DRAFT"|"PENDING"|"IN_REVIEW"|"APPROVED"|"REJECTED"|"NEEDS_MORE_INFO";
  fullName: string;
  documentType: "IDENTITY_FRONT"|"IDENTITY_BACK"|"SELFIE"|"PROOF_OF_ADDRESS"|"OTHER";
  documentNumber: string;
  issuedBy?: string;
  issuedAt?: Date;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewerId?: string;
  reviewerNotes?: string;
  provider?: string;
  autoCheckScore?: number;
  createdAt: Date;
  updatedAt: Date;
};
type VerificationDocument = {
  id: string;
  verificationId: string;
  type: "IDENTITY_FRONT"|"IDENTITY_BACK"|"SELFIE"|"PROOF_OF_ADDRESS"|"OTHER";
  status: "UPLOADED"|"ACCEPTED"|"REJECTED";
  url: string;
  metadata?: Record<string, unknown>;
  reviewerId?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};
type DepositTransaction = {
  id: string;
  bookingId: string;
  type: "HOLD"|"RELEASE"|"PARTIAL_RELEASE"|"FORFEIT"|"REFUND"|"ADJUSTMENT";
  amount: number;
  description?: string;
  createdAt: Date;
  createdById?: string;
};
type SpotModerationLog = {
  id: string;
  spotId: string;
  decision: "AUTO_APPROVED"|"AUTO_REJECTED"|"AUTO_FLAGGED"|"MANUAL_APPROVED"|"MANUAL_REJECTED";
  statusBefore: Spot["status"];
  statusAfter: Spot["status"];
  notes?: string;
  auto: boolean;
  reviewerId?: string;
  meta?: Record<string, unknown>;
  createdAt: Date;
};

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
const blacklistEntries: BlacklistEntry[] = [];
const ownerVerifications: OwnerVerification[] = [];
const verificationDocuments: VerificationDocument[] = [];
const depositTransactions: DepositTransaction[] = [];
const spotModerationLogs: SpotModerationLog[] = [];

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
    update: async ({ where: { id }, data }: any) => {
      const u = users.find(u => u.id === id);
      if (!u) throw new Error('not found');
      Object.assign(u, data);
      return u;
    },
  },
  parkingSpot: {
    findMany: async ({ where, skip = 0, take = 20, orderBy, include }: any) => {
      let list = spots.slice();
      if (where?.status) {
        if (typeof where.status === "string") {
          list = list.filter(s => s.status === where.status);
        } else if (Array.isArray(where.status.in)) {
          list = list.filter(s => where.status.in.includes(s.status));
        }
      }
      if (where?.pricePerHour?.gte != null) list = list.filter(s => s.pricePerHour >= where.pricePerHour.gte);
      if (where?.pricePerHour?.lte != null) list = list.filter(s => s.pricePerHour <= where.pricePerHour.lte);
      ["covered","guarded","camera","evCharging","disabledAccessible","wideEntrance"].forEach((k: any) => {
        if (where?.[k] !== undefined) list = list.filter((s:any) => s[k] === where[k]);
      });
      if (where?.accessType) list = list.filter(s => s.accessType === where.accessType);
      if (orderBy?.createdAt === "desc") list = list.sort((a,b)=>b.createdAt.getTime()-a.createdAt.getTime());
      const page = list.slice(skip, skip + take);
      if (include?.photos || include?.moderationLogs) {
        return page.map(s => ({
          ...s,
          photos: include?.photos
            ? s.photos.slice(0, include.photos.take ?? s.photos.length)
            : undefined,
          moderationLogs: include?.moderationLogs
            ? spotModerationLogs.filter(log => log.spotId === s.id)
            : undefined,
        }));
      }
      return page;
    },
    findUnique: async ({ where: { id }, include }: any) => {
      const s = spots.find(s => s.id === id) || null;
      if (!s) return null;
      if (include?.photos || include?.moderationLogs) {
        return {
          ...s,
          photos: include?.photos ? s.photos : undefined,
          moderationLogs: include?.moderationLogs
            ? spotModerationLogs.filter(log => log.spotId === s.id)
            : undefined,
        };
      }
      return s;
    },
    create: async ({ data }: any) => {
      const s: Spot = { id: cuid(), createdAt: new Date(), updatedAt: new Date(), photos: [], ...data };
      if (data.photos?.create?.length) s.photos = data.photos.create.map((p:any, i:number) => ({ id: cuid(), url: p.url, sortOrder: p.sortOrder ?? i }));
      spots.push(s);
      return s;
    },
    update: async ({ where: { id }, data }: any) => {
      const s = spots.find(s => s.id === id);
      if (!s) throw new Error("not found");
      Object.assign(s, data, { updatedAt: new Date() });
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
      if (include?.spot || include?.renter || include?.depositTransactions) {
        return list.map(b => ({
          ...b,
          spot: include?.spot ? (spots.find(s => s.id === b.spotId) || null) : undefined,
          renter: include?.renter ? (users.find(u => u.id === b.renterId) || null) : undefined,
          depositTransactions: include?.depositTransactions
            ? depositTransactions.filter(tx => tx.bookingId === b.id)
            : undefined,
        }));
      }
      return list;
    },
    create: async ({ data }: any) => {
      const b: Booking = {
        id: cuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
        depositAmount: 0,
        depositStatus: "NOT_REQUIRED",
        penaltyAmount: 0,
        disputeOpenedAt: null,
        disputeResolvedAt: null,
        ...data,
      };
      bookings.push(b); return b;
    },
    findUnique: async ({ where: { id }, include }: any) => {
      const booking = bookings.find(b => b.id === id) || null;
      if (!booking) return null;
      if (include?.depositTransactions || include?.spot || include?.renter) {
        return {
          ...booking,
          spot: include?.spot ? (spots.find(s => s.id === booking.spotId) || null) : undefined,
          renter: include?.renter ? (users.find(u => u.id === booking.renterId) || null) : undefined,
          depositTransactions: include?.depositTransactions
            ? depositTransactions.filter(tx => tx.bookingId === booking.id)
            : undefined,
        };
      }
      return booking;
    },
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
  },
  blacklistEntry: {
    findMany: async ({ where, include }: any) => {
      let list = blacklistEntries.slice();
      if (where?.ownerId) list = list.filter(b => b.ownerId === where.ownerId);
      if (where?.renterId) list = list.filter(b => b.renterId === where.renterId);
      if (include?.renter) {
        return list.map(b => ({
          ...b,
          renter: users.find(u => u.id === b.renterId) || null,
        }));
      }
      return list;
    },
    create: async ({ data }: any) => {
      const entry: BlacklistEntry = { id: cuid(), createdAt: new Date(), ...data };
      blacklistEntries.push(entry);
      return entry;
    },
    delete: async ({ where: { id } }: any) => {
      const index = blacklistEntries.findIndex(b => b.id === id);
      if (index === -1) throw new Error("not found");
      const [removed] = blacklistEntries.splice(index, 1);
      return removed;
    }
  },
  ownerVerification: {
    findFirst: async ({ where }: any = {}) => {
      let list = ownerVerifications.slice();
      if (where?.ownerId) list = list.filter(item => item.ownerId === where.ownerId);
      if (where?.status) list = list.filter(item => item.status === where.status);
      return list[0] || null;
    },
    findMany: async ({ where, orderBy, take }: any = {}) => {
      let list = ownerVerifications.slice();
      if (where?.ownerId) list = list.filter(item => item.ownerId === where.ownerId);
      if (where?.status) list = list.filter(item => item.status === where.status);
      if (orderBy?.createdAt === "desc") list = list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      if (typeof take === "number") list = list.slice(0, take);
      return list;
    },
    create: async ({ data }: any) => {
      const now = new Date();
      const verification: OwnerVerification = {
        id: cuid(),
        status: "PENDING",
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
        ...data,
      };
      ownerVerifications.push(verification);
      return verification;
    },
    update: async ({ where: { id }, data }: any) => {
      const item = ownerVerifications.find(v => v.id === id);
      if (!item) throw new Error("not found");
      Object.assign(item, data, { updatedAt: new Date() });
      return item;
    },
  },
  verificationDocument: {
    findMany: async ({ where }: any = {}) => {
      let list = verificationDocuments.slice();
      if (where?.verificationId) list = list.filter(doc => doc.verificationId === where.verificationId);
      return list;
    },
    create: async ({ data }: any) => {
      const now = new Date();
      const doc: VerificationDocument = {
        id: cuid(),
        status: "UPLOADED",
        createdAt: now,
        updatedAt: now,
        ...data,
      };
      verificationDocuments.push(doc);
      return doc;
    },
    update: async ({ where: { id }, data }: any) => {
      const doc = verificationDocuments.find(d => d.id === id);
      if (!doc) throw new Error("not found");
      Object.assign(doc, data, { updatedAt: new Date() });
      return doc;
    },
    deleteMany: async ({ where }: any = {}) => {
      let count = 0;
      for (let i = verificationDocuments.length - 1; i >= 0; i -= 1) {
        const doc = verificationDocuments[i];
        const matchesVerification = !where?.verificationId || doc.verificationId === where.verificationId;
        if (matchesVerification) {
          verificationDocuments.splice(i, 1);
          count += 1;
        }
      }
      return { count };
    },
  },
  depositTransaction: {
    findMany: async ({ where }: any = {}) => {
      let list = depositTransactions.slice();
      if (where?.bookingId) list = list.filter(t => t.bookingId === where.bookingId);
      return list;
    },
    create: async ({ data }: any) => {
      const tx: DepositTransaction = {
        id: cuid(),
        createdAt: new Date(),
        ...data,
      };
      depositTransactions.push(tx);
      return tx;
    },
  },
  spotModerationLog: {
    findMany: async ({ where, orderBy, take }: any = {}) => {
      let list = spotModerationLogs.slice();
      if (where?.spotId) list = list.filter(log => log.spotId === where.spotId);
      if (where?.decision) list = list.filter(log => log.decision === where.decision);
      if (where?.statusAfter) list = list.filter(log => log.statusAfter === where.statusAfter);
      if (orderBy?.createdAt === "desc") list = list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      if (typeof take === "number") list = list.slice(0, take);
      return list;
    },
    create: async ({ data }: any) => {
      const log: SpotModerationLog = {
        id: cuid(),
        auto: false,
        createdAt: new Date(),
        ...data,
      };
      spotModerationLogs.push(log);
      return log;
    },
  }
};


