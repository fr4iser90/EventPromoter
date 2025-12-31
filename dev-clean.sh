#!/bin/bash

echo "🧹 Killing old development processes..."

# Kill vite processes
if pgrep -f "vite" > /dev/null; then
    echo "📱 Killing Vite processes..."
    pkill -f "vite"
    sleep 1
else
    echo "📱 No Vite processes found"
fi

# Kill tsx processes
if pgrep -f "tsx" > /dev/null; then
    echo "🖥️  Killing TSX processes..."
    pkill -f "tsx"
    sleep 1
else
    echo "🖥️  No TSX processes found"
fi

echo "✅ Ports freed"
echo "🚀 Starting servers..."
echo ""

# Start the development servers
npm run dev
