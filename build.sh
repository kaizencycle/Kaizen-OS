#!/bin/bash
echo "=== Render Build Script ==="
echo "Current directory: $(pwd)"
echo "Files in directory:"
ls -la
echo ""
echo "Checking requirements.txt:"
if [ -f "requirements.txt" ]; then
    echo "requirements.txt found!"
    echo "File size: $(wc -c < requirements.txt) bytes"
    echo "File content:"
    cat requirements.txt
    echo ""
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    echo "ERROR: requirements.txt not found!"
    exit 1
fi
