#!/bin/bash

# Habit Tracker - Start Script
# Starts both frontend and backend servers

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Habit Tracker...${NC}"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend (Django)
echo -e "${GREEN}Starting backend server...${NC}"
cd "$PROJECT_DIR/backend"
python manage.py runserver &
BACKEND_PID=$!

# Start frontend (Vite)
echo -e "${GREEN}Starting frontend server...${NC}"
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}Both servers are running!${NC}"
echo -e "  Backend:  ${YELLOW}http://127.0.0.1:8000${NC}"
echo -e "  Frontend: ${YELLOW}http://localhost:5173${NC}"
echo -e "\nPress Ctrl+C to stop both servers.\n"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
