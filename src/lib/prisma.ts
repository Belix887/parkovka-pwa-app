// Simple mock implementation without Prisma dependency
let prisma: any;

if (process.env.USE_MOCKS === "1") {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	prisma = require("./prisma.mock").prisma;
} else {
	// Try to load Prisma, fallback to mock if not available
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { PrismaClient } = require("@prisma/client");
		const globalForPrisma = global as any;
		prisma = globalForPrisma.prisma || new PrismaClient();
		if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
	} catch (error) {
		console.warn("Prisma not available, using mock:", (error as Error).message);
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		prisma = require("./prisma.mock").prisma;
	}
}

export { prisma };


