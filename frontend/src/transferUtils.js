/**
 * https://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable-string
 * 
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
export function humanFileSize(bytes, si = false, dp = 0) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
  }

  const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
      bytes /= thresh;
      ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


  return bytes.toFixed(dp) + ' ' + units[u];
}

export function humanFileSizePair(bytes, si = false, dp = 0) {
  const [amount, unit] = humanFileSize(bytes, si, dp).split(" ")
  return { amount, unit }
}

export const humanFileType = (type) => {
  if (!type) return "binary"
  if (type == "application/octet-stream") return "binary"
  const split = type.split("/")
  return split.length <= 1 ? split : split[1].replace(/^x-/, "")
}

export const getTransferLink = (transfer) => {
  const hash = transfer.k ? `#${transfer.k}` : ""
  return `${window.location.origin}/transfer/${transfer.secretCode}${hash}`
}

export const copyTransferLink = async (transfer) => {
  await navigator.clipboard.writeText(getTransferLink(transfer))
}

const textEnc = new TextEncoder()
const textDec = new TextDecoder()

export const encodeString = (str) => {
  return textEnc.encode(str)
}
export const decodeString = (arr) => {
  return textDec.decode(arr)
}