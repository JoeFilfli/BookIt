import { getResend, EMAIL_FROM } from "./client";
import {
  bookingConfirmationSubject,
  bookingConfirmationHtml,
  bookingConfirmationText,
  type BookingConfirmationData,
} from "./templates/booking-confirmation";
import {
  bookingNotificationSubject,
  bookingNotificationHtml,
  bookingNotificationText,
  type BookingNotificationData,
} from "./templates/booking-notification";
import {
  bookingCancellationSubject,
  bookingCancellationHtml,
  bookingCancellationText,
  type BookingCancellationData,
} from "./templates/booking-cancellation";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

export interface BookingEmailPayload {
  booking: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    totalPrice: unknown;
    resource: {
      name: string;
      business: {
        id: string;
        name: string;
        slug: string;
        address: string;
        phone: string;
        owner: { name: string; email: string };
      };
    };
    service: { name: string; currency: string };
    user: { name: string; email: string };
  };
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function sendBookingConfirmation(payload: BookingEmailPayload) {
  const { booking } = payload;

  const data: BookingConfirmationData = {
    customerName: booking.user.name,
    businessName: booking.resource.business.name,
    serviceName: booking.service.name,
    resourceName: booking.resource.name,
    date: formatDate(booking.date),
    startTime: booking.startTime,
    endTime: booking.endTime,
    price: Number(booking.totalPrice).toFixed(2),
    currency: booking.service.currency,
    businessAddress: booking.resource.business.address,
    businessPhone: booking.resource.business.phone,
    bookingsUrl: `${BASE_URL}/bookings`,
  };

  const { error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to: booking.user.email,
    subject: bookingConfirmationSubject(data),
    html: bookingConfirmationHtml(data),
    text: bookingConfirmationText(data),
  });

  if (error) {
    console.error("Failed to send booking confirmation:", error);
  }
}

export async function sendBookingNotification(payload: BookingEmailPayload) {
  const { booking } = payload;

  const data: BookingNotificationData = {
    ownerName: booking.resource.business.owner.name,
    customerName: booking.user.name,
    serviceName: booking.service.name,
    resourceName: booking.resource.name,
    date: formatDate(booking.date),
    startTime: booking.startTime,
    endTime: booking.endTime,
    dashboardUrl: `${BASE_URL}/dashboard/bookings`,
  };

  const { error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to: booking.resource.business.owner.email,
    subject: bookingNotificationSubject(data),
    html: bookingNotificationHtml(data),
    text: bookingNotificationText(data),
  });

  if (error) {
    console.error("Failed to send booking notification:", error);
  }
}

export async function sendBookingCancellation(
  payload: BookingEmailPayload,
  cancelledBy: "customer" | "business"
) {
  const { booking } = payload;

  const baseData = {
    cancelledBy,
    customerName: booking.user.name,
    businessName: booking.resource.business.name,
    serviceName: booking.service.name,
    resourceName: booking.resource.name,
    date: formatDate(booking.date),
    startTime: booking.startTime,
    endTime: booking.endTime,
    bookingsUrl: `${BASE_URL}/bookings`,
  };

  // Send to customer
  const customerData: BookingCancellationData = {
    ...baseData,
    recipientName: booking.user.name,
  };

  const customerResult = getResend().emails.send({
    from: EMAIL_FROM,
    to: booking.user.email,
    subject: bookingCancellationSubject(customerData),
    html: bookingCancellationHtml(customerData),
    text: bookingCancellationText(customerData),
  });

  // Send to business owner
  const ownerData: BookingCancellationData = {
    ...baseData,
    recipientName: booking.resource.business.owner.name,
    bookingsUrl: `${BASE_URL}/dashboard/bookings`,
  };

  const ownerResult = getResend().emails.send({
    from: EMAIL_FROM,
    to: booking.resource.business.owner.email,
    subject: bookingCancellationSubject(ownerData),
    html: bookingCancellationHtml(ownerData),
    text: bookingCancellationText(ownerData),
  });

  const results = await Promise.allSettled([customerResult, ownerResult]);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`Failed to send cancellation email to ${i === 0 ? "customer" : "owner"}:`, r.reason);
    }
  });
}
