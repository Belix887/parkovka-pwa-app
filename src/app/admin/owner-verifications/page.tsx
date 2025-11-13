import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AdminOwnerVerificationTable } from "@/components/admin/AdminOwnerVerificationTable";

export default async function AdminOwnerVerificationsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "ADMIN") {
    redirect("/");
  }

  const verifications = await prisma.ownerVerification.findMany({
    orderBy: { createdAt: "desc" } as any,
    take: 50,
  });

  const items = await Promise.all(
    verifications.map(async (verification) => {
      const owner = await prisma.user.findUnique({
        where: { id: verification.ownerId },
      });
      const documents = await prisma.verificationDocument.findMany({
        where: { verificationId: verification.id },
      });
      return {
        id: verification.id,
        status: verification.status,
        submittedAt: verification.submittedAt
          ? verification.submittedAt.toISOString()
          : null,
        owner: owner
          ? {
              id: owner.id,
              email: owner.email,
              name: owner.name,
            }
          : null,
        fullName: verification.fullName,
        documentNumber: verification.documentNumber,
        reviewerNotes: verification.reviewerNotes,
        documents: documents.map((doc) => ({
          id: doc.id,
          type: doc.type,
          status: doc.status,
          url: doc.url,
          uploadedAt: doc.createdAt.toISOString(),
        })),
      };
    })
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Модерация владельцев</h1>
        <AdminOwnerVerificationTable items={items} />
      </div>
    </div>
  );
}

