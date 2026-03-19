export interface BookingConfirmationData {
  customerName: string;
  businessName: string;
  serviceName: string;
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string;
  currency: string;
  businessAddress: string;
  businessPhone: string;
  bookingsUrl: string;
}

export function bookingConfirmationSubject(data: BookingConfirmationData): string {
  return `Booking Confirmed — ${data.serviceName} at ${data.businessName}`;
}

export function bookingConfirmationHtml(data: BookingConfirmationData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #2563eb;">Booking Confirmed</h2>
  <p>Hi ${data.customerName},</p>
  <p>Your booking has been confirmed. Here are the details:</p>

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
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 0; color: #6b7280;">Total</td>
      <td style="padding: 10px 0; font-weight: 600;">${data.price} ${data.currency}</td>
    </tr>
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 0; color: #6b7280;">Address</td>
      <td style="padding: 10px 0;">${data.businessAddress}</td>
    </tr>
    <tr>
      <td style="padding: 10px 0; color: #6b7280;">Phone</td>
      <td style="padding: 10px 0;">${data.businessPhone}</td>
    </tr>
  </table>

  <p style="color: #6b7280; font-size: 14px;">
    Need to cancel? You can do so anytime from your bookings page.
  </p>

  <a href="${data.bookingsUrl}" style="display: inline-block; margin-top: 12px; background: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
    View My Bookings
  </a>
</body>
</html>`;
}

export function bookingConfirmationText(data: BookingConfirmationData): string {
  return `Booking Confirmed — ${data.businessName}

Hi ${data.customerName},

Your booking is confirmed:

Business:  ${data.businessName}
Service:   ${data.serviceName}
Resource:  ${data.resourceName}
Date:      ${data.date}
Time:      ${data.startTime} – ${data.endTime}
Total:     ${data.price} ${data.currency}
Address:   ${data.businessAddress}
Phone:     ${data.businessPhone}

Need to cancel? Visit: ${data.bookingsUrl}
`;
}
