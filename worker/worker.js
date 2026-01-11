import cron from "node-cron"

import { MongoClient } from "mongodb"
import { controlTransferDelete, post } from "./lib/nodeApi.js"

import Fastify from 'fastify'
import fastifySensible from '@fastify/sensible'
import { SignJWT } from "jose"
import { getPrivateKey, getPublicKey } from "./lib/keyManager.js"
import { lookup } from "doc999tor-fast-geoip"
import pino from "pino"

const PINO_CONF = {
  level: "info",
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
}

const logger = pino(PINO_CONF)

const app = Fastify({ logger: PINO_CONF, requestTimeout: 0 })
app.register(fastifySensible)

let client
let db

async function dbConnect() {
  const dbName = process.env.MONGODB_DB_NAME
  const MONGODB_HOST = process.env.NODE_ENV == "development" ? "localhost" : "mongo"
  const MONGODB_URL = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@${MONGODB_HOST}:${process.env.MONGODB_HOST_PORT}`

  logger.info(`MONGODB_URL: mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:**************@${MONGODB_HOST}:${process.env.MONGODB_HOST_PORT}`)

  if (!client) {
    client = new MongoClient(MONGODB_URL)
    await client.connect()
    db = client.db(dbName)
  }
}

await dbConnect()

const deleteExpiredTransfers = async () => {
  const currentTime = new Date()

  logger.debug(`Deleting expired transfers...`)
  const expiredTransfers = await db.collection("transfers").find({
    $and: [
      { expiresAt: { $lt: currentTime } },
      { expiresAt: { $ne: 0 } }
    ]
  }).toArray()
  for (let transfer of expiredTransfers) {
    await controlTransferDelete(transfer.nodeUrl, transfer._id.toString())
    await db.collection("transfers").deleteOne({ _id: transfer._id })
  }

  logger.info(`Deleted ${expiredTransfers.length} expired transfers`)
}

app.post("/sign", async (req, reply) => {
  const { payload, expirationTime } = req.body

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256" })
    .setAudience("transfer.zip")
    .setExpirationTime(expirationTime)
    .sign(await getPrivateKey())

  return { success: true, token }
})

app.post("/geo-slow", async (req, reply) => {
  const { ip } = req.body
  const geo = await lookup(ip)
  return { success: true, geo }
})

app.post("/forward-node-control/*", async (req, reply) => {
  const endpoint = req.params["*"]
  const { nodeUrl, ...restBody } = req.body
  const res = await post(nodeUrl, `/control/${endpoint}`, restBody)
  return res
})

cron.schedule("*/15 * * * *", deleteExpiredTransfers)
deleteExpiredTransfers()

console.log(await getPublicKey())

await app.listen({ port: 3001, host: process.env.NODE_ENV === "development" ? '127.0.0.1' : '0.0.0.0' })