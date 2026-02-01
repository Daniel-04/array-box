#!/bin/bash
# Build Docker sandbox images for Array Box
# Usage: ./build.sh [language]
# Examples:
#   ./build.sh        # Build all images
#   ./build.sh j      # Build only J image
#   ./build.sh kap    # Build only Kap image

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

build_image() {
    local lang=$1
    local image_name="arraybox-sandbox-$lang"
    local dockerfile="Dockerfile.$lang"
    
    if [ ! -f "$dockerfile" ]; then
        echo "Error: $dockerfile not found"
        return 1
    fi
    
    echo "=========================================="
    echo "Building $image_name..."
    echo "=========================================="
    
    docker build -t "$image_name" -f "$dockerfile" .
    
    echo "✓ Successfully built $image_name"
    echo ""
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Build requested images
if [ -n "$1" ]; then
    # Build specific image
    build_image "$1"
else
    # Build all images
    echo "Building all sandbox images..."
    echo ""
    
    # J is the most straightforward
    build_image "j"
    
    # Kap requires JVM
    build_image "kap"
    
    # APL note
    echo "=========================================="
    echo "Note: APL sandbox requires Dyalog APL to be"
    echo "mounted from your host system at runtime."
    echo "See docker/Dockerfile.apl for details."
    echo "=========================================="
    
    echo ""
    echo "✓ All sandbox images built successfully!"
    echo ""
    echo "To run servers with sandboxing enabled:"
    echo "  node servers/server-manager.cjs --sandbox"
fi
