$ErrorActionPreference = "Stop"

$BINARY_NAME = "netenv"
$VERSION = if ($env:VERSION) { $env:VERSION } else { "dev" }
$BUILD_TIME = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$LDFLAGS = "-X github.com/netenv/netenv/pkg/version.Version=$VERSION -X github.com/netenv/netenv/pkg/version.BuildTime=$BUILD_TIME"

if (!(Test-Path "bin")) {
    New-Item -ItemType Directory -Path "bin" | Out-Null
}

Write-Host "Building for windows/amd64..."
$env:GOOS = "windows"
$env:GOARCH = "amd64"
go build -ldflags $LDFLAGS -o "bin/$BINARY_NAME-windows-amd64.exe" ./cmd/netenv/

Write-Host "Build complete!"
Get-ChildItem bin/
