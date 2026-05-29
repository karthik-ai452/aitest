#!/bin/bash
set -e

echo "=== CmdRunner Web — Installation ==="

# Install Python dependencies
cd "$(dirname "$0")/.."
pip install --break-system-packages --quiet -r requirements.txt 2>/dev/null || pip install -r requirements.txt 2>/dev/null || true

echo "=== Installation Complete ==="