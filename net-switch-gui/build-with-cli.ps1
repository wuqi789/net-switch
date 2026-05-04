$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$GuiDir = $ScriptDir
$CliDir = Join-Path (Join-Path $ScriptDir "..") "net-switch"
$ResourcesDir = Join-Path (Join-Path $GuiDir "src-tauri") "resources"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " NetSwitch GUI + CLI Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n[1/4] Building Go CLI binary..." -ForegroundColor Yellow

if (!(Test-Path $CliDir)) {
    Write-Host "  ERROR: CLI project directory not found: $CliDir" -ForegroundColor Red
    Write-Host "  Please ensure net-switch is at the same level as net-switch-gui" -ForegroundColor Red
    exit 1
}

Push-Location $CliDir
try {
    $env:GOOS = "windows"
    $env:GOARCH = "amd64"

    $Ldflags = "-s -w"

    Write-Host "  Source: $CliDir" -ForegroundColor Gray
    Write-Host "  Output: net-switch.exe" -ForegroundColor Gray

    go build -ldflags $Ldflags -o "net-switch.exe" ./cmd/net-switch/

    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Go build failed (exit code $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }

    Write-Host "  OK: net-switch.exe built successfully" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host "`n[2/4] Copying CLI binary to resources..." -ForegroundColor Yellow

if (!(Test-Path $ResourcesDir)) {
    New-Item -ItemType Directory -Path $ResourcesDir -Force | Out-Null
}

$CliBinary = Join-Path $CliDir "net-switch.exe"
$DestBinary = Join-Path $ResourcesDir "net-switch.exe"
Copy-Item $CliBinary $DestBinary -Force
Write-Host "  OK: net-switch.exe -> $DestBinary" -ForegroundColor Green

$DefaultConfig = Join-Path $ResourcesDir "config.default.yaml"
if (!(Test-Path $DefaultConfig)) {
    Write-Host "  WARNING: Default config not found: $DefaultConfig" -ForegroundColor Yellow
} else {
    Write-Host "  OK: config.default.yaml exists" -ForegroundColor Green
}

Write-Host "`n[3/4] Installing GUI frontend dependencies..." -ForegroundColor Yellow

Push-Location $GuiDir
try {
    if (!(Test-Path "node_modules")) {
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  ERROR: npm install failed" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  OK: node_modules already exists, skipping" -ForegroundColor Green
    }
} finally {
    Pop-Location
}

Write-Host "`n[4/4] Building Tauri installer..." -ForegroundColor Yellow

Push-Location $GuiDir
try {
    npm run tauri build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERROR: Tauri build failed (exit code $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
    Write-Host "  OK: Installer built successfully" -ForegroundColor Green
} finally {
    Pop-Location
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

$NsisDir = "$GuiDir\src-tauri\target\release\bundle\nsis"
if (Test-Path $NsisDir) {
    Write-Host "`nNSIS installer location:" -ForegroundColor Yellow
    Get-ChildItem $NsisDir -Filter "*.exe" | ForEach-Object {
        Write-Host "  $($_.FullName)" -ForegroundColor White
    }
}
