#!/bin/bash
docker compose up signaling-server &
cd web-server/ && npm start > /dev/null 2>&1
