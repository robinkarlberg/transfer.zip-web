"use server"
import { readFileSync } from "fs"

let cached = global.conf

if (!cached) {
  cached = global.conf = { conf: null }
}

export function getConf() {
  if (!cached.conf) {
    cached.conf = JSON.parse(readFileSync("./conf.json"))
  }
  return cached.conf
}
