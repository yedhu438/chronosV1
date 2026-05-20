# ── Chronos Deployment Script ─────────────────────────────────────────────────
# Run this as Administrator in PowerShell on the VPS

Set-ExecutionPolicy Bypass -Scope Process -Force

# 1. Create deployment folder
$deployPath = "C:\inetpub\wwwroot\Event calander"
New-Item -ItemType Directory -Force -Path $deployPath | Out-Null
Write-Host "✓ Folder created: $deployPath" -ForegroundColor Green

# 2. Install Chocolatey (package manager)
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..." -ForegroundColor Yellow
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Host "✓ Chocolatey installed" -ForegroundColor Green
} else {
    Write-Host "✓ Chocolatey already installed" -ForegroundColor Green
}

# 3. Install Node.js LTS
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Node.js..." -ForegroundColor Yellow
    choco install nodejs-lts -y
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Host "✓ Node.js installed" -ForegroundColor Green
} else {
    Write-Host "✓ Node.js $(node -v) already installed" -ForegroundColor Green
}

# 4. Install Git
if (!(Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Git..." -ForegroundColor Yellow
    choco install git -y
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    Write-Host "✓ Git installed" -ForegroundColor Green
} else {
    Write-Host "✓ Git $(git --version) already installed" -ForegroundColor Green
}

# 5. Clone repo
Set-Location $deployPath
if (Test-Path ".git") {
    Write-Host "Updating existing repo..." -ForegroundColor Yellow
    git pull origin master
} else {
    Write-Host "Cloning repo..." -ForegroundColor Yellow
    git clone https://github.com/yedhu438/chronosV1 .
}
Write-Host "✓ Code ready" -ForegroundColor Green

# 6. Create .env file
$envContent = @"
ADMIN_USERNAME=admin1
ADMIN_PASSWORD=123456
NEXTAUTH_SECRET=chronos-secret-fm-2026
NEXTAUTH_URL=http://81.0.219.26:3000
SMTP_HOST=send.one.com
SMTP_PORT=465
SMTP_USER=yedhu@fullymerched.com
SMTP_PASS=kIchap-3rojmu-qovquw
SMTP_FROM=FullyMerched Chronos <yedhu@fullymerched.com>
CRON_SECRET=your-cron-secret
LARK_WEBHOOK_URL=https://open.larksuite.com/open-apis/bot/v2/hook/c04024f4-6d0d-4836-9c01-fd3d8c8ff2e5
DB_PATH=C:\inetpub\wwwroot\Event calander\chronos.db
"@
$envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
Write-Host "✓ .env created" -ForegroundColor Green

# 7. Install dependencies
Write-Host "Installing npm packages..." -ForegroundColor Yellow
npm install
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# 8. Build the app
Write-Host "Building Next.js app..." -ForegroundColor Yellow
npm run build
Write-Host "✓ Build complete" -ForegroundColor Green

# 9. Install PM2 and start the app
Write-Host "Setting up PM2..." -ForegroundColor Yellow
npm install -g pm2
pm2 stop chronos 2>$null
pm2 delete chronos 2>$null
pm2 start npm --name "chronos" -- start -- --port 3000
pm2 save
pm2 startup
Write-Host "✓ App running on port 3000" -ForegroundColor Green

# 10. Open firewall for port 3000
netsh advfirewall firewall delete rule name="Chronos App" 2>$null
netsh advfirewall firewall add rule name="Chronos App" dir=in action=allow protocol=TCP localport=3000
Write-Host "✓ Firewall rule added for port 3000" -ForegroundColor Green

Write-Host ""
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Chronos is live at http://81.0.219.26:3000" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
