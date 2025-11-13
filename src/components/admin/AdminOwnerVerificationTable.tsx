"use client";

import { useState } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

type VerificationStatus =
  | "DRAFT"
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "NEEDS_MORE_INFO";

type VerificationDocumentType =
  | "IDENTITY_FRONT"
  | "IDENTITY_BACK"
  | "SELFIE"
  | "PROOF_OF_ADDRESS"
  | "OTHER";

type VerificationDocumentStatus = "UPLOADED" | "ACCEPTED" | "REJECTED";

interface VerificationDocument {
  id: string;
  type: VerificationDocumentType;
  status: VerificationDocumentStatus;
  url: string;
  uploadedAt: string;
}

interface VerificationItem {
  id: string;
  status: VerificationStatus;
  submittedAt: string | null;
  owner: { id: string; email: string; name?: string | null } | null;
  fullName: string;
  documentNumber: string;
  reviewerNotes?: string | null;
  documents: VerificationDocument[];
}

interface AdminOwnerVerificationTableProps {
  items: VerificationItem[];
}

const STATUS_CONFIG: Record<
  VerificationStatus,
  { label: string; variant: "default" | "success" | "warning" | "error" | "info" }
> = {
  DRAFT: { label: "Черновик", variant: "default" },
  PENDING: { label: "Отправлено", variant: "info" },
  IN_REVIEW: { label: "На проверке", variant: "info" },
  APPROVED: { label: "Одобрено", variant: "success" },
  REJECTED: { label: "Отклонено", variant: "error" },
  NEEDS_MORE_INFO: { label: "Нужна информация", variant: "warning" },
};

const DOCUMENT_LABELS: Record<VerificationDocumentType, string> = {
  IDENTITY_FRONT: "Основной документ",
  IDENTITY_BACK: "Оборотная сторона",
  SELFIE: "Селфи",
  PROOF_OF_ADDRESS: "Подтверждение адреса",
  OTHER: "Доп. документ",
};

export function AdminOwnerVerificationTable({
  items: initialItems,
}: AdminOwnerVerificationTableProps) {
  const { showError, showSuccess } = useToast();
  const [items, setItems] = useState(initialItems);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAction = async (
    id: string,
    status: "APPROVED" | "REJECTED" | "NEEDS_MORE_INFO"
  ) => {
    let reviewerNotes: string | undefined;
    if (status === "REJECTED" || status === "NEEDS_MORE_INFO") {
      const promptText =
        status === "REJECTED"
          ? "Укажите причину отклонения заявки"
          : "Уточните, какие сведения нужно дополнить";
      const input = window.prompt(promptText);
      if (input === null) {
        return;
      }
      reviewerNotes = input;
    }

    try {
      setProcessingId(id);
      const res = await fetch(`/api/admin/owner-verifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewerNotes,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Не удалось обновить статус");
      }

      const payload = await res.json();
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: payload.verification.status,
                reviewerNotes: payload.verification.reviewerNotes,
              }
            : item
        )
      );

      showSuccess("Статус обновлен");
    } catch (error: unknown) {
      console.error("admin verification update", error);
      showError(
        error instanceof Error ? error.message : "Произошла ошибка при обновлении"
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="grid gap-6">
      {items.length === 0 ? (
        <MotionCard>
          <CardHeader
            title="Нет заявок"
            subtitle="Новые запросы на верификацию будут отображаться здесь"
            icon="✅"
          />
        </MotionCard>
      ) : (
        items.map((item) => (
          <MotionCard key={item.id}>
            <CardHeader
              title={item.fullName}
              subtitle={
                item.owner
                  ? `${item.owner.email} · ${item.documentNumber}`
                  : `Документ: ${item.documentNumber}`
              }
              icon="🧾"
            />
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={STATUS_CONFIG[item.status].variant}>
                  {STATUS_CONFIG[item.status].label}
                </Badge>
                {item.submittedAt && (
                  <span className="text-sm text-[var(--text-secondary)]">
                    Получено{" "}
                    {format(new Date(item.submittedAt), "d MMMM yyyy, HH:mm", {
                      locale: ru,
                    })}
                  </span>
                )}
                {item.reviewerNotes && (
                  <span className="text-sm text-[var(--accent-warning)]">
                    Комментарий: {item.reviewerNotes}
                  </span>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {item.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {DOCUMENT_LABELS[doc.type]}
                      </span>
                      <Badge variant="info" size="sm">
                        {doc.status === "ACCEPTED"
                          ? "Принят"
                          : doc.status === "REJECTED"
                          ? "Отклонен"
                          : "Загружен"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[var(--accent-primary)] underline"
                      >
                        Открыть
                      </a>
                      <span className="text-xs text-[var(--text-muted)]">
                        {format(new Date(doc.uploadedAt), "d MMM yyyy HH:mm", {
                          locale: ru,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 justify-end pt-3 border-t border-[var(--border-primary)]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(item.id, "NEEDS_MORE_INFO")}
                  disabled={processingId === item.id}
                  icon="📝"
                >
                  Запросить данные
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAction(item.id, "REJECTED")}
                  disabled={processingId === item.id}
                  icon="⛔"
                >
                  Отклонить
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAction(item.id, "APPROVED")}
                  disabled={processingId === item.id}
                  icon="✅"
                >
                  Одобрить
                </Button>
              </div>
            </CardContent>
          </MotionCard>
        ))
      )}
    </div>
  );
}

