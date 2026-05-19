import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'send.one.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: Number(process.env.SMTP_PORT || 465) === 465,
  auth: {
    user: process.env.SMTP_USER || 'yedhu@fullymerched.com',
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEventEmail({
  to,
  name,
  eventName,
  eventDate,
  eventDesc,
  daysUntil,
}: {
  to: string;
  name: string;
  eventName: string;
  eventDate: string;
  eventDesc: string;
  daysUntil?: 20 | 7;
}) {
  const eyebrow =
    daysUntil === 20 ? '20-Day Reminder' :
    daysUntil === 7  ? 'Final Week Reminder' :
    'Event Reminder';

  const subject =
    daysUntil === 20 ? `📅 Coming Up in 20 Days: ${eventName}` :
    daysUntil === 7  ? `⚡ Final Week: ${eventName}` :
    `📅 Upcoming: ${eventName}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { background: #0a0a0a; color: #e8e0d0; font-family: Georgia, serif; margin: 0; padding: 40px 0; }
        .wrap { max-width: 560px; margin: 0 auto; background: #111; border: 1px solid rgba(200,151,58,0.2); }
        .header { padding: 32px 40px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .logo { font-size: 12px; letter-spacing: 4px; text-transform: uppercase; color: #c8973a; }
        .body { padding: 40px; }
        .eyebrow { font-size: 10px; letter-spacing: 4px; text-transform: uppercase; color: rgba(200,151,58,0.6); margin-bottom: 12px; }
        .title { font-size: 32px; font-weight: 700; color: #fff; line-height: 1.1; margin-bottom: 20px; }
        .date { font-size: 11px; letter-spacing: 2px; color: rgba(200,151,58,0.7); margin-bottom: 16px; }
        .desc { font-size: 14px; color: rgba(232,224,208,0.6); line-height: 1.6; }
        .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.04); font-size: 10px; color: rgba(255,255,255,0.15); letter-spacing: 2px; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header">
          <div class="logo">FullyMerched Chronos</div>
        </div>
        <div class="body">
          <div class="eyebrow">${eyebrow}</div>
          <div class="title">${eventName}</div>
          <div class="date">📅 ${eventDate}</div>
          <div class="desc">Hi ${name},<br/><br/>${eventDesc}</div>
        </div>
        <div class="footer">FullyMerched Chronos · Event Intelligence Platform</div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'FullyMerched Chronos <yedhu@fullymerched.com>',
    to,
    subject,
    html,
  });
}
