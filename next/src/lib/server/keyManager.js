"use server"

import { promises as fs } from 'fs'
import { importPKCS8 } from 'jose'

let cached = global.keys

if (!cached) {
  cached = global.keys = { privateKey: null, publicKey: null, privatePromise: null, publicPromise: null }
}

export async function getPrivateKey() {
  const privateKeyPath = process.env.NODE_ENV == "development" ? "../_local_dev_api_data/private.pem" : "/api_data/private.pem"
  if (cached.privateKey) {
    return cached.privateKey
  }
  if (!cached.privatePromise) {
    cached.privatePromise = fs.readFile(privateKeyPath, 'utf8').then(async (data) => {
      const keyData = await importPKCS8(data, "RS256")
      cached.privateKey = keyData
      return keyData
    })
  }
  cached.privateKey = await cached.privatePromise
  return cached.privateKey
}

export async function getPublicKey() {
  const publicKeyPath = process.env.NODE_ENV == "development" ? "../_local_dev_api_data/public.pem" : "/api_data/public.pem"
  if (cached.publicKey) {
    return cached.publicKey
  }
  if (!cached.publicPromise) {
    cached.publicPromise = fs.readFile(publicKeyPath, 'utf8').then((data) => {
      cached.publicKey = data
      return data
    })
  }
  cached.publicKey = await cached.publicPromise
  return cached.publicKey
}
