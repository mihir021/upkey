#!/bin/bash

# ==============================================================================
# Joyory / Upkey Local Development Launcher
# Starts Python ML Service (:8000), Express Backend (:5001), and Vite Frontend (:5173).
# Press Ctrl+C at any time to stop all services cleanly.
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "=================================================="
echo "  🚀 Starting Joyory Development Servers"
echo "=================================================="

# Function to clean up background processes on exit
cleanup() {
  echo ""
  echo "🛑 Stopping all services..."
  kill $(jobs -p) 2>/dev/null
  wait $(jobs -p) 2>/dev/null
  echo "✅ All servers stopped."
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start Python ML Microservice (AI Shopping Assistant)
if [ -f "ml-service/venv/bin/uvicorn" ]; then
  echo "🤖 Starting AI/ML Service (http://127.0.0.1:8000)..."
  (cd ml-service && ./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000) &
  sleep 1
fi

# 2. Start Backend Server (Express on :5001)
echo "📡 Starting Backend (http://localhost:5001)..."
npm --prefix server run dev &

# Brief pause to let the backend initialize
sleep 2

# 3. Start Frontend Client (Vite on :5173)
echo "💻 Starting Frontend (http://localhost:5173)..."
npm --prefix client run dev &

# Wait for all processes
wait
