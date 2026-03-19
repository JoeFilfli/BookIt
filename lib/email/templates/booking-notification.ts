export interface BookingNotificationData {
  ownerName: string;
  customerName: string;
  serviceName: string;
  resourceName: string;
  date: string;
  startTime: string;
  endTime: string;
  dashboardUrl: string;
}

export function bookingNotificationSubject(data: BookingNotificationData): string {
  return `New Booking — ${data.serviceName} by ${data.customerName}`;
}

export function bookingNotificationHtml(data: BookingNotificationData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #2563eb;">New Booking</h2>
  <p>Hi ${data.ownerName},</p>
  <p>You have a new booking:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 10px 0; color: #6b7280; width: 40%;">Customer</td>
      <td style="padding: 10px 0; font-weight: 600;">${data.customerName}</td>
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
    <tr>
      <td style="padding: 10px 0; color: #6b7280;">Time</td>
      <td style="padding: 10px 0;">${data.startTime} – ${data.endTime}</td>
    </tr>
  </table>

  <a href="${data.dashboardUrl}" style="display: inline-block; margin-top: 12px; background: #2563eb; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
    View in Dashboard
  </a>
</body>
</html>`;
}

export function bookingNotificationText(data: BookingNotificationData): string {
  return `New Booking — ${data.serviceName}

Hi ${data.ownerName},

New booking received:

Customer:  ${data.customerName}
Service:   ${data.serviceName}
Resource:  ${data.resourceName}
Date:      ${data.date}
Time:      ${data.startTime} – ${data.endTime}

View in dashboard: ${data.dashboardUrl}
`;
}
