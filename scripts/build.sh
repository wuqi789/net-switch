#!/bin/bash
set -e

BINARY_NAME="net-switch"
VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "dev")
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
LDFLAGS="-X github.com/netenv/netenv/pkg/version.Version=${VERSION} -X github.com/netenv/netenv/pkg/version.BuildTime=${BUILD_TIME}"

build_for_platform() {
    local goos=$1
    local goarch=$2
    local ext=""
    
    if [ "$goos" = "windows" ]; then
        ext=".exe"
    fi
    
    echo "Building for ${goos}/${goarch}..."
    GOOS=$goos GOARCH=$goarch go build -ldflags "$LDFLAGS" -o "bin/${BINARY_NAME}-${goos}-${goarch}${ext}" ./cmd/netenv/
}

mkdir -p bin

build_for_platform "windows" "amd64"
build_for_platform "darwin" "amd64"
build_for_platform "darwin" "arm64"
build_for_platform "linux" "amd64"
build_for_platform "linux" "arm64"

echo "Build complete!"
ls -la bin/
