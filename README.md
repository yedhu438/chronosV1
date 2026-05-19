# FullyMerched Chronos

Event Intelligence Platform — Next.js app for campaign planning and automated notifications.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **SQLite** via sql.js (no native binaries, file-based persistence)
- **NextAuth v4** (credentials-based admin login)
- **Nodemailer** (email notifications)
- **Twilio** (WhatsApp notifications)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Copy `.env.local` and fill in your values:

```env
NEXTAUTH_SECRET=your-random-secret        # generate: openssl rand -base64 32
NEXTAUTH_URL=http://your-domain.com       # or http://localhost:3000

ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password

# SMTP (Gmail example — use App Password, not account password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=FullyMerched Chronos <you@gmail.com>

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 3. Run in development
```bash
npm run dev
```

### 4. Build for production
```bash
npm run build
npm start
```

---

## Windows VPS Deployment

### Prerequisites
- Node.js 18+ installed
- PM2: `npm install -g pm2`
- (Optional) Caddy for reverse proxy + auto SSL

### Deploy steps

```bash
# 1. Clone / copy project to server
# 2. Install deps and build
npm install
npm run build

# 3. Start with PM2
pm2 start npm --name "chronos" -- start
pm2 save
pm2 startup   # follow the printed command to auto-start on reboot

# 4. View logs
pm2 logs chronos
```

### Caddy (reverse proxy + SSL)
Create `Caddyfile`:
```
your-domain.com {
    reverse_proxy localhost:3000
}
```
Run: `caddy start`

---

## Features

| Feature | Description |
|---|---|
| Home | Hero + upcoming events with live countdowns |
| Events | Full event roster, all categories |
| Calendar | Month grid with event dots + day drawer |
| Admin | Login-protected CRUD for events, subscribers, notifications |
| Email | Send event reminders via SMTP to all subscribers |
| WhatsApp | Send via Twilio WhatsApp API |
| Notif Log | Full log of sent notifications with status |

## Default credentials
```
Username: admin
Password: admin123
```
**Change these in `.env.local` before deploying.**

## Database
SQLite file created at `chronos.db` in the project root on first run.
To back up: just copy `chronos.db`.
To reset: delete `chronos.db` — it will reseed on next start.
