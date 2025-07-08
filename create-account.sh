#!/bin/bash

read -p "Email: " email
read -s -p "Password: " password
echo
read -p "Web Server Port: " port

curl -X POST http://localhost:$port/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$email\", \"password\": \"$password\"}"