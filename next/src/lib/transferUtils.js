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

export function humanFileSizeWithUnit(bytes, unit = 'B', si = false, dp = 0) {
  const thresh = si ? 1000 : 1024;
  const units = si
    ? ['B', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  const unitIndex = units.indexOf(unit);
  if (unitIndex === -1) {
    throw new Error('Invalid unit');
  }
  bytes /= Math.pow(thresh, unitIndex);
  return bytes.toFixed(dp);
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

/**
 * Collapses folder uploads into one entry per top-level folder, the way they look on disk,
 * so a transfer with thousands of files still lists as a handful of rows. Keeps upload order.
 * @param {{ name: string, size?: number, type?: string }[]} files stored file infos or browser `File`s
 * @param {(file: any) => string} pathOf defaults to the stored `relativePath`; pass `webkitRelativePath` for `File`s
 */
export const groupFilesByFolder = (files, pathOf = file => file.relativePath || file.name) => {
  const entries = []
  const folders = new Map()
  files.forEach((file, i) => {
    const path = pathOf(file)
    const slash = path.indexOf("/")
    if (slash === -1) {
      entries.push({ key: `file:${i}`, name: path, folder: false, type: file.type, count: 1, size: file.size || 0, files: [file] })
      return
    }
    const name = path.slice(0, slash)
    let folder = folders.get(name)
    if (!folder) {
      folder = { key: `folder:${name}`, name, folder: true, count: 0, size: 0, files: [] }
      folders.set(name, folder)
      entries.push(folder)
    }
    folder.count++
    folder.size += file.size || 0
    folder.files.push(file)
  })
  return entries
}

/** "1 file", "25,081 files" */
export const formatCount = (count, noun) => `${count.toLocaleString("en-US")} ${noun}${count === 1 ? "" : "s"}`

const textEnc = new TextEncoder()
const textDec = new TextDecoder()

export const encodeString = (str) => {
  return textEnc.encode(str)
}
export const decodeString = (arr) => {
  return textDec.decode(arr)
}