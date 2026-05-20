Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072

# 1. Create deployment folder
$deployPath = "C:\inetpub\wwwroot\Event calander"
New-Item -ItemType Directory -Force -Path $deployPath | Out-Null
Write-Host "Folder created: $deployPath"

# 2. Install Chocolatey
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Chocolatey..."
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    refreshenv
} else {
    Write-Host "Chocolatey already installed"
}

# 3. Install Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Node.js..."
    choco install nodejs-lts -y
    refreshenv
} else {
    Write-Host "Node.js already installed"
}

# 4. Install Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Git..."
    choco install git -y
    refreshenv
} else {
    Write-Host "Git already installed"
}

# 5. Clone or update repo
Set-Location $deployPath
if (Test-Path ".git") {
    Write-Host "Updating repo..."
    git pull origin master
} else {
    Write-Host "Cloning repo..."
    git clone https://github.com/yedhu438/chronosV1 .
}

# 6. Create .env
Write-Host "Creating .env..."
$envContent = "ADMIN_USERNAME=admin1`nADMIN_PASSWORD=123456`nNEXTAUTH_SECRET=chronos-secret-fm-2026`nNEXTAUTH_URL=http://81.0.219.26:3000`nSMTP_HOST=send.one.com`nSMTP_PORT=465`nSMTP_USER=yedhu@fullymerched.com`nSMTP_PASS=kIchap-3rojmu-qovquw`nSMTP_FROM=FullyMerched Chronos <yedhu@fullymerched.com>`nCRON_SECRET=your-cron-secret`nLARK_WEBHOOK_URL=https://open.larksuite.com/open-apis/bot/v2/hook/c04024f4-6d0d-4836-9c01-fd3d8c8ff2e5`nDB_PATH=C:\inetpub\wwwroot\Event calander\chronos.db"
Set-Content -Path ".env" -Value $envContent -Encoding UTF8

# 7. Install dependencies
Write-Host "Installing packages..."
npm install

# 8. Build
Write-Host "Building app..."
npm run build

# 9. Install PM2 and start app
Write-Host "Starting app with PM2..."
npm install -g pm2
pm2 stop chronos 2>$null
pm2 delete chronos 2>$null
pm2 start npm --name "chronos" -- start -- --port 3000
pm2 save

# 10. Firewall rule
netsh advfirewall firewall delete rule name="Chronos App" 2>$null | Out-Null
netsh advfirewall firewall add rule name="Chronos App" dir=in action=allow protocol=TCP localport=3000

Write-Host ""
Write-Host "Deployment complete!"
Write-Host "Site is live at: http://81.0.219.26:3000"
