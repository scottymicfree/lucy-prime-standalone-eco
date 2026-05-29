#!/bin/bash

# Navigate to the script's directory, or just run from root if expected to be at root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ ! -d "EnhancedLucyMind" ]; then
    echo "Error: EnhancedLucyMind directory not found."
    exit 1
fi

cd EnhancedLucyMind

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

if [ -f "requirements.txt" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
else
    echo "requirements.txt not found in EnhancedLucyMind/"
    exit 1
fi

echo "Setup complete. To activate the environment, run:"
echo "source EnhancedLucyMind/venv/bin/activate"
