#!/bin/bash

# Function to handle the termination of the script
cleanup() {
  echo "Stopping MongoDB container..."
  docker compose down mongo
  exit
}

# Trap SIGINT (Ctrl+C) to call the cleanup function
trap cleanup SIGINT

# Start the MongoDB containers
docker compose up -d mongo
echo "MongoDB container started."

# Navigate to the 'next' directory and run the development server
cd next && npm run dev &

# Wait until the script is interrupted
wait
