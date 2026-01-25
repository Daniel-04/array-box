#!/bin/bash
# Build script for Uiua WASM module
set -e

cd "$(dirname "$0")"

echo "=== Building Uiua WASM module ==="

# Check for wasm-pack
if ! command -v wasm-pack &> /dev/null; then
    echo "Installing wasm-pack..."
    cargo install wasm-pack
fi

# Add wasm32 target if not present
if ! rustup target list --installed | grep -q wasm32-unknown-unknown; then
    echo "Adding wasm32-unknown-unknown target..."
    rustup target add wasm32-unknown-unknown
fi

# Build the WASM module for web (no bundler needed)
echo "Building WASM module..."
wasm-pack build --target web --release --out-dir ../wasm

echo ""
echo "=== Build complete! ==="
echo "WASM files are in: ../wasm/"
echo ""
echo "The following files were generated:"
ls -la ../wasm/*.{js,wasm} 2>/dev/null || echo "(files will be created after successful build)"
