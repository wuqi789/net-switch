#!/bin/bash
set -e

BINARY_NAME="netenv"
INSTALL_DIR="/usr/local/bin"

if [ "$(uname)" = "Darwin" ]; then
    PLATFORM="darwin"
elif [ "$(uname)" = "Linux" ]; then
    PLATFORM="linux"
else
    echo "Unsupported platform"
    exit 1
fi

ARCH=$(uname -m)
if [ "$ARCH" = "x86_64" ]; then
    ARCH="amd64"
elif [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
    ARCH="arm64"
fi

BINARY_PATH="bin/${BINARY_NAME}-${PLATFORM}-${ARCH}"

if [ ! -f "$BINARY_PATH" ]; then
    echo "Binary not found: $BINARY_PATH"
    echo "Please run 'make build-all' first"
    exit 1
fi

echo "Installing $BINARY_NAME to $INSTALL_DIR..."
sudo cp "$BINARY_PATH" "$INSTALL_DIR/$BINARY_NAME"
sudo chmod +x "$INSTALL_DIR/$BINARY_NAME"

echo "Installation complete!"
$INSTALL_DIR/$BINARY_NAME version
