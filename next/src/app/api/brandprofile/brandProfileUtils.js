import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import sharp from "sharp";

export async function cropIconTo64Png(buffer) {
  return await sharp(buffer)
    .resize(64, 64, {
      fit: 'contain',
      position: 'center',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer()
}

export async function cropBackgroundTo1920x1080(buffer) {
  return await sharp(buffer)
    .resize(1920, 1080, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg()
    .toBuffer()
}

export async function dataUrlToBuffer(url) {
  if (typeof url !== 'string') {
    throw new Error('Invalid URL')
  }
  try {
    const parsed = new URL(url)
    if (!['data:'].includes(parsed.protocol)) {
      throw new Error('Unsupported protocol')
    }
  } catch {
    throw new Error('Malformed URL')
  }

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer)
}

let cachedS3 = global.s3

if (!cachedS3) {
  cachedS3 = global.s3 = { client: null }
}

/**
 * 
 * @returns {S3Client}
 */
function getS3Client() {
  if (cachedS3.client) {
    return cachedS3.client
  }

  cachedS3.client = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
    }
  })

  return cachedS3.client
}

export async function uploadBufferToS3({ buffer, bucket, key, contentType }) {
  const client = getS3Client()
  await client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType
  }))
}

export async function deleteObjectFromS3({ key }) {
  const client = getS3Client()
  await client.send(new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key
  }))
}

export function getBrandIconUrl(brandProfileId) {
  return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${getBrandIconPath(brandProfileId)}`
}

export function getBrandBackgroundUrl(brandProfileId) {
  return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${getBrandBackgroundPath(brandProfileId)}`
}

function getBrandIconPath(brandProfileId) {
  return `assets/brandprofiles/${brandProfileId}/icon.png`
}

function getBrandBackgroundPath(brandProfileId) {
  return `assets/brandprofiles/${brandProfileId}/background.jpg`
}

export async function processAndUploadBrandProfileImages({ iconUrl, backgroundUrl, brandProfileId }) {
  const processed = {}

  // console.log(iconUrl)
  if (iconUrl) {
    // If it starts with data: it has been updated from client
    // otherwise starts with https://<bucket n shit>
    if (iconUrl.startsWith("data:")) {
      try {
        const iconBuf = await dataUrlToBuffer(iconUrl)
        const croppedIcon = await cropIconTo64Png(iconBuf)
        const iconKey = getBrandIconPath(brandProfileId)
        await uploadBufferToS3({
          buffer: croppedIcon,
          key: iconKey,
          contentType: "image/png"
        })
        processed.iconUrl = getBrandIconUrl(brandProfileId) + "?" + Date.now()
      } catch (e) {
        console.error(e)
        throw new Error("Invalid icon image")
      }
    }
    else {
      processed.iconUrl = iconUrl
    }
  }
  else {
    await deleteObjectFromS3({ key: getBrandIconPath(brandProfileId) })
    processed.iconUrl = undefined
  }

  if (backgroundUrl) {
    // If it starts with data: it has been updated from client
    // otherwise starts with https://<bucket n shit>
    if (backgroundUrl.startsWith("data:")) {
      try {
        const bgBuf = await dataUrlToBuffer(backgroundUrl)
        const croppedBg = await cropBackgroundTo1920x1080(bgBuf)
        const bgKey = getBrandBackgroundPath(brandProfileId)
        await uploadBufferToS3({
          buffer: croppedBg,
          key: bgKey,
          contentType: "image/jpeg"
        })
        processed.backgroundUrl = getBrandBackgroundUrl(brandProfileId) + "?" + Date.now()
      } catch (e) {
        console.error(e)
        throw new Error("Invalid background image")
      }
    }
    else {
      processed.backgroundUrl = backgroundUrl
    }
  }
  else {
    await deleteObjectFromS3({ key: getBrandBackgroundPath(brandProfileId) })
    processed.backgroundUrl = undefined
  }

  return processed
}
