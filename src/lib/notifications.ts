/**
 * Библиотека для отправки уведомлений
 */

interface EmailNotification {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Отправить email уведомление
 * В продакшене здесь должна быть интеграция с почтовым сервисом (SendGrid, AWS SES, etc.)
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<boolean> {
  try {
    // В режиме разработки просто логируем
    if (process.env.NODE_ENV === "development" || process.env.USE_MOCKS === "1") {
      console.log("📧 Email notification:", { to, subject, html });
      return true;
    }

    // В продакшене здесь будет реальная отправка через API
    // Например, через SendGrid:
    // const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: to }] }],
    //     from: { email: process.env.FROM_EMAIL },
    //     subject,
    //     content: [{ type: "text/html", value: html }],
    //   }),
    // });
    // return response.ok;

    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}

/**
 * Отправить уведомление о создании бронирования
 */
export async function sendBookingCreatedNotification(
  renterEmail: string,
  ownerEmail: string,
  booking: {
    id: string;
    spotTitle: string;
    spotAddress: string;
    startAt: Date;
    endAt: Date;
    totalPrice: number;
  }
): Promise<void> {
  const formatDate = (date: Date) =>
    date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatPrice = (price: number) =>
    `${(price / 100).toLocaleString("ru-RU")} ₽`;

  // Уведомление арендатору
  await sendEmail(
    renterEmail,
    "Бронирование создано",
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Бронирование создано</h2>
        <p>Ваше бронирование парковочного места успешно создано и ожидает подтверждения владельца.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Место:</strong> ${booking.spotTitle}</p>
          <p><strong>Адрес:</strong> ${booking.spotAddress}</p>
          <p><strong>Начало:</strong> ${formatDate(booking.startAt)}</p>
          <p><strong>Окончание:</strong> ${formatDate(booking.endAt)}</p>
          <p><strong>Стоимость:</strong> ${formatPrice(booking.totalPrice)}</p>
        </div>
        <p>Вы получите уведомление, когда владелец подтвердит или отклонит ваше бронирование.</p>
      </div>
    `
  );

  // Уведомление владельцу
  await sendEmail(
    ownerEmail,
    "Новое бронирование",
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Новое бронирование</h2>
        <p>У вас новое бронирование парковочного места, которое требует подтверждения.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Место:</strong> ${booking.spotTitle}</p>
          <p><strong>Адрес:</strong> ${booking.spotAddress}</p>
          <p><strong>Начало:</strong> ${formatDate(booking.startAt)}</p>
          <p><strong>Окончание:</strong> ${formatDate(booking.endAt)}</p>
          <p><strong>Стоимость:</strong> ${formatPrice(booking.totalPrice)}</p>
        </div>
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/owner/requests" style="color: #3b82f6; text-decoration: none;">Подтвердить или отклонить бронирование →</a></p>
      </div>
    `
  );
}

/**
 * Отправить уведомление о подтверждении бронирования
 */
export async function sendBookingApprovedNotification(
  renterEmail: string,
  booking: {
    spotTitle: string;
    spotAddress: string;
    startAt: Date;
    endAt: Date;
  }
): Promise<void> {
  const formatDate = (date: Date) =>
    date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  await sendEmail(
    renterEmail,
    "Бронирование подтверждено",
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Бронирование подтверждено ✅</h2>
        <p>Владелец подтвердил ваше бронирование парковочного места.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Место:</strong> ${booking.spotTitle}</p>
          <p><strong>Адрес:</strong> ${booking.spotAddress}</p>
          <p><strong>Начало:</strong> ${formatDate(booking.startAt)}</p>
          <p><strong>Окончание:</strong> ${formatDate(booking.endAt)}</p>
        </div>
        <p>Не забудьте приехать вовремя!</p>
      </div>
    `
  );
}

/**
 * Отправить уведомление об отмене бронирования
 */
export async function sendBookingCancelledNotification(
  renterEmail: string,
  ownerEmail: string,
  booking: {
    spotTitle: string;
    startAt: Date;
    reason?: string;
  },
  cancelledBy: "renter" | "owner"
): Promise<void> {
  const formatDate = (date: Date) =>
    date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const cancelledByText = cancelledBy === "renter" ? "Арендатор" : "Владелец";

  await sendEmail(
    renterEmail,
    "Бронирование отменено",
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">Бронирование отменено</h2>
        <p>Ваше бронирование было отменено ${cancelledByText.toLowerCase()}ом.</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Место:</strong> ${booking.spotTitle}</p>
          <p><strong>Дата:</strong> ${formatDate(booking.startAt)}</p>
          ${booking.reason ? `<p><strong>Причина:</strong> ${booking.reason}</p>` : ""}
        </div>
      </div>
    `
  );

  if (cancelledBy === "renter") {
    await sendEmail(
      ownerEmail,
      "Бронирование отменено арендатором",
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Бронирование отменено</h2>
          <p>Арендатор отменил бронирование вашего парковочного места.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Место:</strong> ${booking.spotTitle}</p>
            <p><strong>Дата:</strong> ${formatDate(booking.startAt)}</p>
            ${booking.reason ? `<p><strong>Причина:</strong> ${booking.reason}</p>` : ""}
          </div>
        </div>
      `
    );
  }
}

/**
 * Отправить напоминание о предстоящем бронировании
 */
export async function sendBookingReminder(
  renterEmail: string,
  booking: {
    spotTitle: string;
    spotAddress: string;
    startAt: Date;
    routeDistance?: number;
    routeDuration?: number;
  },
  hoursBefore: number
): Promise<void> {
  const formatDate = (date: Date) =>
    date.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDistance = (meters?: number) => {
    if (!meters) return "";
    if (meters < 1000) return `${Math.round(meters)} м`;
    return `${(meters / 1000).toFixed(1)} км`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours} ч ${remainingMinutes} мин`;
  };

  await sendEmail(
    renterEmail,
    `Напоминание: бронирование через ${hoursBefore} час(ов)`,
    `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">Напоминание о бронировании</h2>
        <p>Ваше бронирование парковочного места начинается через ${hoursBefore} час(ов).</p>
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p><strong>Место:</strong> ${booking.spotTitle}</p>
          <p><strong>Адрес:</strong> ${booking.spotAddress}</p>
          <p><strong>Начало:</strong> ${formatDate(booking.startAt)}</p>
          ${booking.routeDistance ? `<p><strong>Расстояние:</strong> ${formatDistance(booking.routeDistance)}</p>` : ""}
          ${booking.routeDuration ? `<p><strong>Время в пути:</strong> ${formatDuration(booking.routeDuration)}</p>` : ""}
        </div>
        <p>Не забудьте приехать вовремя!</p>
      </div>
    `
  );
}
