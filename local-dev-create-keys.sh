#!/bin/sh

KEY_DIR="./_api_data"
PRIVATE_KEY="$KEY_DIR/private.pem"
PUBLIC_KEY="$KEY_DIR/public.pem"

if [ ! -f "$PRIVATE_KEY" ]; then
  echo "Generating RSA key pair..."
  mkdir -p "$KEY_DIR"
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$PRIVATE_KEY" \
    && openssl rsa -in "$PRIVATE_KEY" -pubout -out "$PUBLIC_KEY"

  chmod 600 "$PRIVATE_KEY"
  chmod 644 "$PUBLIC_KEY"
else
  echo "Key pair already exists."
fi

exec "$@"
