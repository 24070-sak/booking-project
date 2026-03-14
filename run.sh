#!/bin/bash

# Hotely - Local Runner
# Starts Backend (Flask) and Frontend (Vite)

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Hotel Booking Project...${NC}"

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    # Force kill if still alive
    fuser -k 5000/tcp 2>/dev/null
    fuser -k 5173/tcp 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# 0. Kill existing processes on ports 5000 and 5173
echo -e "${YELLOW}🧹 Cleaning up ports 5000 and 5173...${NC}"
fuser -k 5000/tcp 2>/dev/null
fuser -k 5173/tcp 2>/dev/null

# 1. Start Backend
echo -e "${BLUE}📂 Starting Backend (Flask)...${NC}"
cd "$PROJECT_ROOT/Backend"

# Ensure dependencies are installed (optional but good for first run)
# pip install -r requirements.txt > /dev/null 2>&1

python3 run.py > flask.log 2>&1 &
BACKEND_PID=$!

sleep 2
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend is running (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend failed to start. Check Backend/flask.log${NC}"
    # Try one more time with a different approach if fuser failed
    python3 run.py &
    BACKEND_PID=$!
fi

# 2. Start Frontend
echo -e "${BLUE}🌐 Starting Frontend (Vite)...${NC}"
cd "$PROJECT_ROOT/Frontend"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 node_modules missing, running npm install...${NC}"
    npm install
fi

# Run Vite
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}✨ Project is ready!${NC}"
echo -e "${YELLOW}🔗 Frontend URL: ${BLUE}http://localhost:5173${NC}"
echo -e "${YELLOW}🔗 Backend URL:  ${BLUE}http://localhost:5000${NC}"

wait $BACKEND_PID $FRONTEND_PID
