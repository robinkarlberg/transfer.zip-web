#!/bin/bash

cd api/ && npm start &
cd frontend/ && npm start > /dev/null 2>&1 &

# ./stripecli.sh &

docker compose up mongo 1>/dev/null