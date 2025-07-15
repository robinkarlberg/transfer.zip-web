#!/bin/bash

# Function to handle the termination of the script
cleanup() {
  echo "Stopping containers..."
  docker compose down mongo signaling-server
  exit
}

# Trap SIGINT (Ctrl+C) to call the cleanup function
trap cleanup SIGINT

# Start the containers
docker compose up -d mongo signaling-server
echo "Containers started."

cd worker && npm run dev &

# Navigate to the 'next' directory and run the development server
cd next && npm run dev &

# Wait until the script is interrupted
wait
