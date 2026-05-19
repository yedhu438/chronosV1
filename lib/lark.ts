export async function sendLarkNotification({
  eventName,
  eventDate,
  eventDesc,
  daysUntil,
}: {
  eventName: string;
  eventDate: string;
  eventDesc: string;
  daysUntil?: 20 | 7;
}) {
  const webhookUrl = process.env.LARK_WEBHOOK_URL;
  if (!webhookUrl) throw new Error('LARK_WEBHOOK_URL is not set');

  const isUrgent = daysUntil === 7;

  const headerTitle =
    daysUntil === 20 ? `🗓️ Mark Your Calendar — ${eventName} in 20 Days!` :
    daysUntil === 7  ? `🚨 One Week Away — ${eventName} is Almost Here!` :
    `📣 Heads Up — ${eventName} is Coming Up!`;

  const countdownLine =
    daysUntil === 20 ? '⏳ **20 days to go** — plenty of time to prepare!' :
    daysUntil === 7  ? '🔥 **Only 7 days left** — don\'t miss it!' :
    '📌 **Coming up soon!**';

  const body = {
    msg_type: 'interactive',
    card: {
      config: { wide_screen_mode: true },
      header: {
        title: { tag: 'plain_text', content: headerTitle },
        template: isUrgent ? 'red' : 'orange',
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `## 📅  ${eventDate}`,
          },
        },
        { tag: 'hr' },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: countdownLine,
          },
        },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: `📝  ${eventDesc}`,
          },
        },
        { tag: 'hr' },
        {
          tag: 'div',
          text: {
            tag: 'lark_md',
            content: '✨ _FullyMerched Chronos · Stay ahead of every moment_',
          },
        },
      ],
    },
  };

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Lark webhook failed: ${res.status}`);
  const json = await res.json();
  if (json.code && json.code !== 0) throw new Error(`Lark error: ${json.msg}`);
}
