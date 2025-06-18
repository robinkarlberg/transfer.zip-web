#!/bin/bash

# Function to handle the termination of the script
cleanup() {
  echo "Stopping MongoDB and Signaling container..."
  docker compose down mongo signaling-server
  exit
}

# Trap SIGINT (Ctrl+C) to call the cleanup function
trap cleanup SIGINT

# Start the MongoDB and Signaling containers
docker compose up -d mongo signaling-server
echo "MongoDB container started."

# Navigate to the 'next' directory and run the development server
cd next && npm run dev &

# Wait until the script is interrupted
wait
