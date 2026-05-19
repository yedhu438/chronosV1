import twilio from 'twilio';

export async function sendWhatsApp({
  to,
  name,
  eventName,
  eventDate,
}: {
  to: string;
  name: string;
  eventName: string;
  eventDate: string;
}) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  const body = `*FullyMerched Chronos* 📅\n\nHi ${name},\n\nReminder: *${eventName}* is coming up on ${eventDate}.\n\nPlan your listings early for maximum impact!\n\n— FullyMerched Team`;

  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
    to: `whatsapp:${to}`,
    body,
  });
}
