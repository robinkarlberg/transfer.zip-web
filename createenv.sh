#!/bin/sh

# Stop if the root .env already exists
if [ -f .env ]; then
  echo ".env already exists — please remove or rename it before running this script."
  exit 1
fi

cp .env.example .env
cp next/.env.example next/.env
cp next/conf.json.example next/conf.json

RANDOM_HEX=$(openssl rand -hex 16)
sed -i "s/^MONGO_INITDB_ROOT_PASSWORD=.*/MONGO_INITDB_ROOT_PASSWORD=$RANDOM_HEX/" .env