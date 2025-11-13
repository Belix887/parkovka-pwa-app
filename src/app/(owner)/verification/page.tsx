import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MobileNavigation } from "@/components/ui/MobileNavigation";
import { OwnerVerificationForm } from "@/components/owner/OwnerVerificationForm";

export default async function OwnerVerificationPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "OWNER") {
    redirect("/profile");
  }

  const verification = await prisma.ownerVerification.findFirst({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" } as any,
  });

  const documents = verification
    ? await prisma.verificationDocument.findMany({
        where: { verificationId: verification.id },
      })
    : [];

  const initialData = verification
    ? {
        id: verification.id,
        status: verification.status,
        fullName: verification.fullName,
        documentType: verification.documentType,
        documentNumber: verification.documentNumber,
        issuedBy: verification.issuedBy,
        issuedAt: verification.issuedAt ? verification.issuedAt.toISOString() : null,
        submittedAt: verification.submittedAt
          ? verification.submittedAt.toISOString()
          : null,
        reviewedAt: verification.reviewedAt
          ? verification.reviewedAt.toISOString()
          : null,
        reviewerNotes: verification.reviewerNotes,
        documents: documents.map((doc) => ({
          id: doc.id,
          type: doc.type,
          status: doc.status,
          url: doc.url,
          uploadedAt: doc.createdAt.toISOString(),
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-tertiary)]">
      <MobileNavigation user={user} />
      <div className="pt-14 md:pt-0">
        <div className="container py-8 md:py-12">
          <OwnerVerificationForm initialData={initialData} />
        </div>
      </div>
    </div>
  );
}

