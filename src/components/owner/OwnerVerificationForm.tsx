"use client";

import { useState } from "react";
import { MotionCard, CardHeader, CardContent } from "@/components/ui/MotionCard";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { StatCard } from "@/components/ui/StatCard";
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

interface InitialDocument {
  id: string;
  type: VerificationDocumentType;
  status: VerificationDocumentStatus;
  url: string;
  uploadedAt: string;
}

interface InitialData {
  id: string;
  status: VerificationStatus;
  fullName: string;
  documentType: VerificationDocumentType;
  documentNumber: string;
  issuedBy?: string | null;
  issuedAt?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  reviewerNotes?: string | null;
  documents: InitialDocument[];
}

interface OwnerVerificationFormProps {
  initialData: InitialData | null;
}

type LocalDocument = {
  id?: string;
  type: VerificationDocumentType;
  url: string;
  fileName?: string;
  status?: VerificationDocumentStatus;
};

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

const DOCUMENT_TYPE_OPTIONS: Array<{ value: VerificationDocumentType; label: string }> = [
  { value: "IDENTITY_FRONT", label: "Основной документ (паспорт, права)" },
  { value: "IDENTITY_BACK", label: "Оборотная сторона документа" },
  { value: "SELFIE", label: "Селфи с документом" },
  { value: "PROOF_OF_ADDRESS", label: "Подтверждение адреса" },
  { value: "OTHER", label: "Дополнительный документ" },
];

export function OwnerVerificationForm({ initialData }: OwnerVerificationFormProps) {
  const { showError, showSuccess, showInfo } = useToast();
  const [fullName, setFullName] = useState(initialData?.fullName ?? "");
  const [documentNumber, setDocumentNumber] = useState(initialData?.documentNumber ?? "");
  const [documentType, setDocumentType] = useState<VerificationDocumentType>(
    initialData?.documentType ?? "IDENTITY_FRONT"
  );
  const [issuedBy, setIssuedBy] = useState(initialData?.issuedBy ?? "");
  const [issuedAt, setIssuedAt] = useState(
    initialData?.issuedAt ? initialData.issuedAt.slice(0, 10) : ""
  );
  const [documents, setDocuments] = useState<LocalDocument[]>(
    initialData?.documents?.map((doc) => ({
      id: doc.id,
      type: doc.type,
      url: doc.url,
      status: doc.status,
    })) ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [extraDocumentType, setExtraDocumentType] =
    useState<VerificationDocumentType>("SELFIE");

  const status = initialData?.status ?? "DRAFT";

  const handleFileUpload = async (
    file: File,
    type: VerificationDocumentType
  ) => {
    try {
      setIsUploading(true);
      const signResponse = await fetch("/api/uploads/sign", {
        method: "POST",
      });
      if (!signResponse.ok) {
        throw new Error("Не удалось получить ссылку загрузки");
      }
      const signed = await signResponse.json();
      let publicUrl = signed.publicUrl as string | undefined;
      if (signed.signedUrl && signed.method) {
        const uploadHeaders: Record<string, string> = signed.headers || {};
        if (!uploadHeaders["Content-Type"]) {
          uploadHeaders["Content-Type"] = file.type || "image/jpeg";
        }
        const uploadRes = await fetch(signed.signedUrl, {
          method: signed.method,
          headers: uploadHeaders,
          body: file,
        });
        if (!uploadRes.ok) {
          throw new Error("Ошибка при загрузке файла");
        }
        publicUrl = signed.publicUrl;
      }
      if (!publicUrl) {
        throw new Error("Не удалось получить ссылку на документ");
      }

      setDocuments((prev) => {
        const filtered = prev.filter((doc) => doc.type !== type);
        return [
          ...filtered,
          {
            type,
            url: publicUrl!,
            fileName: file.name,
          },
        ];
      });
      showSuccess("Документ загружен");
    } catch (error: unknown) {
      console.error("Upload error", error);
      showError("Не удалось загрузить документ. Попробуйте снова.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = (type: VerificationDocumentType) => {
    setDocuments((prev) => prev.filter((doc) => doc.type !== type));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!documents.length) {
      showInfo("Добавьте хотя бы один документ");
      return;
    }
    if (!fullName.trim() || !documentNumber.trim()) {
      showInfo("Заполните все обязательные поля");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/owner/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          documentType,
          documentNumber,
          issuedBy: issuedBy || undefined,
          issuedAt: issuedAt ? new Date(issuedAt).toISOString() : undefined,
          documents: documents.map((doc) => ({
            type: doc.type,
            url: doc.url,
          })),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error || "Не удалось отправить заявку");
      }

      showSuccess("Заявка отправлена. Мы проверим документы в ближайшее время.");
      window.location.reload();
    } catch (error: unknown) {
      console.error("verification submit", error);
      showError(
        error instanceof Error ? error.message : "Произошла ошибка. Повторите попытку."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainDocument = documents.find((doc) => doc.type === documentType);
  const extraDocs = documents.filter((doc) => doc.type !== documentType);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-3">
          Проверка владельца
        </h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Пройдите верификацию, чтобы публиковать парковочные места и принимать оплату без ограничений.
          Мы бережно храним переданные данные и используем их только для подтверждения личности.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Текущий статус"
          value={STATUS_CONFIG[status].label}
          icon="🛂"
          className="bg-[var(--bg-secondary)]"
        />
        <StatCard
          title="Документов загружено"
          value={documents.length}
          icon="📄"
          className="bg-[var(--bg-secondary)]"
        />
        <StatCard
          title="Комментарий модератора"
          value={initialData?.reviewerNotes ? "Есть" : "—"}
          icon="✍️"
          className="bg-[var(--bg-secondary)]"
        />
      </div>

      <MotionCard className="mobile-card">
        <CardHeader
          title="Статус заявки"
          subtitle="Отслеживайте прогресс и историю изменений"
          icon="ℹ️"
        />
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={STATUS_CONFIG[status].variant}>
              {STATUS_CONFIG[status].label}
            </Badge>
            {initialData?.submittedAt && (
              <span className="text-sm text-[var(--text-secondary)]">
                Отправлено{" "}
                {format(new Date(initialData.submittedAt), "d MMMM yyyy, HH:mm", {
                  locale: ru,
                })}
              </span>
            )}
            {initialData?.reviewedAt && (
              <span className="text-sm text-[var(--text-secondary)]">
                Проверено{" "}
                {format(new Date(initialData.reviewedAt), "d MMMM yyyy, HH:mm", {
                  locale: ru,
                })}
              </span>
            )}
          </div>
          {initialData?.reviewerNotes && (
            <div className="rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                Комментарий модератора
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                {initialData.reviewerNotes}
              </p>
            </div>
          )}
        </CardContent>
      </MotionCard>

      <form onSubmit={handleSubmit}>
        <MotionCard className="mobile-card">
          <CardHeader
            title="Личные данные"
            subtitle="Должны совпадать с информацией в документе"
            icon="👤"
          />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Input
              label="ФИО"
              placeholder="Иванов Иван Иванович"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
            <Input
              label="Номер документа"
              placeholder="00 00 000000"
              value={documentNumber}
              onChange={(event) => setDocumentNumber(event.target.value)}
              required
            />
            <Input
              label="Кем выдан"
              placeholder="ГУ МВД России по г. Москве"
              value={issuedBy}
              onChange={(event) => setIssuedBy(event.target.value)}
            />
            <Input
              label="Дата выдачи"
              type="date"
              value={issuedAt}
              onChange={(event) => setIssuedAt(event.target.value)}
            />
          </CardContent>
        </MotionCard>

        <MotionCard className="mobile-card mt-6">
          <CardHeader
            title="Документы"
            subtitle="Загрузите качественные фотографии без бликов"
            icon="📄"
          />
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Основной документ
                </label>
                <select
                  className="w-full px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
                  value={documentType}
                  onChange={(event) =>
                    setDocumentType(event.target.value as VerificationDocumentType)
                  }
                >
                  {DOCUMENT_TYPE_OPTIONS.filter(
                    (option) =>
                      option.value === "IDENTITY_FRONT" || option.value === "IDENTITY_BACK"
                  ).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-[var(--text-primary)]">
                  Фотография документа
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void handleFileUpload(file, documentType);
                    }
                  }}
                  className="text-sm text-[var(--text-secondary)]"
                  disabled={isUploading}
                />
                {mainDocument && (
                  <div className="rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] p-3 mt-2">
                    <p className="text-sm text-[var(--text-primary)]">
                      Файл загружен. Тип: {mainDocument.type}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <a
                        href={mainDocument.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-[var(--accent-primary)] underline"
                      >
                        Открыть
                      </a>
                      <button
                        type="button"
                        className="text-sm text-[var(--accent-error)] underline"
                        onClick={() => handleRemoveDocument(mainDocument.type)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-[var(--border-primary)] pt-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Дополнительные документы
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Селфи или подтверждение адреса помогут пройти проверку быстрее.
                  </p>
                </div>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  <select
                    className="w-full md:w-auto px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition"
                    value={extraDocumentType}
                    onChange={(event) =>
                      setExtraDocumentType(
                        event.target.value as VerificationDocumentType
                      )
                    }
                  >
                    {DOCUMENT_TYPE_OPTIONS.filter(
                      (option) => option.value !== documentType
                    ).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void handleFileUpload(file, extraDocumentType);
                      }
                    }}
                    className="text-sm text-[var(--text-secondary)]"
                    disabled={isUploading}
                  />
                </div>
              </div>

              {extraDocs.length > 0 && (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {extraDocs.map((doc) => (
                    <div
                      key={doc.type}
                      className="rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)] p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {DOCUMENT_TYPE_OPTIONS.find((option) => option.value === doc.type)
                            ?.label || doc.type}
                        </span>
                        <Badge variant="info" size="sm">
                          {doc.status === "ACCEPTED"
                            ? "Принят"
                            : doc.status === "REJECTED"
                            ? "Отклонен"
                            : "Загружен"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[var(--accent-primary)] underline"
                        >
                          Просмотр
                        </a>
                        <button
                          type="button"
                          className="text-sm text-[var(--accent-error)] underline"
                          onClick={() => handleRemoveDocument(doc.type)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </MotionCard>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <p className="text-sm text-[var(--text-muted)]">
            Нажимая «Отправить на проверку», вы подтверждаете, что согласны с обработкой персональных данных.
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon="📮"
              disabled={isSubmitting || isUploading}
            >
              {isSubmitting ? "Отправка..." : "Отправить на проверку"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

