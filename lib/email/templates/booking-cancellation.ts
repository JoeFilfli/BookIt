export interface BookingCancellationData {
  recipientName: string;
  cancelledBy: "customer" | "business";
  customerName: string;
  businessName: string;
  serviceName: string;
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  bookingsUrl: string;
}

export function bookingCancellationSubject(data: BookingCancellationData): string {
  return `Booking Cancelled — ${data.serviceName} at ${data.businessName}`;
}

export function bookingCancellationHtml(data: BookingCancellationData): string {
  const cancelledByLabel =
    data.cancelledBy === "customer"
      ? `Cancelled by customer (${data.customerName})`
      : `Cancelled by ${data.businessName}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #dc2626;">Booking Cancelled</h2>
  <p>Hi ${data.recipientName},</p>
  <p>The following booking has been cancelled:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 0; color: #6b7280; width: 40%;">Business</td>
      <td style="padding: 10px 0; font-weight: 600;">${data.businessName}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 0; color: #6b7280;">Service</td>
      <td style="padding: 10px 0;">${data.serviceName}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 0; color: #6b7280;">Resource</td>
      <td style="padding: 10px 0;">${data.resourceName}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 0; color: #6b7280;">Date</td>
      <td style="padding: 10px 0;">${data.date}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 0; color: #6b7280;">Time</td>
      <td style="padding: 10px 0;">${data.startTime} – ${data.endTime}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; color: #6b7280;">Cancelled by</td>
      <td style="padding: 10px 0;">${cancelledByLabel}</td>
    </tr>
  </table>

  <a href="${data.bookingsUrl}" style="display: inline-block; margin-top: 12px; background: #6b7280; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
    View My Bookings
  </a>
</body>
</html>`;
}

export function bookingCancellationText(data: BookingCancellationData): string {
  const cancelledByLabel =
    data.cancelledBy === "customer"
      ? `Cancelled by customer (${data.customerName})`
      : `Cancelled by ${data.businessName}`;

  return `Booking Cancelled — ${data.businessName}

Hi ${data.recipientName},

The following booking has been cancelled:

Business:     ${data.businessName}
Service:      ${data.serviceName}
Resource:     ${data.resourceName}
Date:         ${data.date}
Time:         ${data.startTime} – ${data.endTime}
Cancelled by: ${cancelledByLabel}

View bookings: ${data.bookingsUrl}
`;
}
