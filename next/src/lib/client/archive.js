import * as zip from "@zip.js/zip.js";

const TAR_BLOCK_SIZE = 512;
const ZIP_SIGNATURES = [
  [0x50, 0x4b, 0x03, 0x04],
  [0x50, 0x4b, 0x05, 0x06],
  [0x50, 0x4b, 0x07, 0x08],
];
const RAR_SIGNATURE = [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07];
const SEVEN_ZIP_SIGNATURE = [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c];

export const ARCHIVE_ACCEPT = ".zip,.tar,application/zip,application/x-tar";
export const SUPPORTED_ARCHIVE_LABEL = "ZIP and uncompressed TAR";

export async function openArchive(file) {
  const header = new Uint8Array(await file.slice(0, TAR_BLOCK_SIZE).arrayBuffer());
  const extension = getArchiveExtension(file.name);

  if (hasSignature(header, RAR_SIGNATURE) || extension === ".rar") {
    throw new Error("RAR archives are not supported yet. Choose a ZIP or uncompressed TAR archive.");
  }

  if (hasSignature(header, SEVEN_ZIP_SIGNATURE) || extension === ".7z") {
    throw new Error("7-Zip archives are not supported yet. Choose a ZIP or uncompressed TAR archive.");
  }

  if (isGzip(header) || extension === ".tgz" || extension === ".tar.gz") {
    throw new Error("Compressed TAR archives are not supported yet. Choose an uncompressed .tar file.");
  }

  if (ZIP_SIGNATURES.some((signature) => hasSignature(header, signature)) || extension === ".zip") {
    return openZipArchive(file);
  }

  if (isTarHeader(header) || extension === ".tar") {
    return openTarArchive(file);
  }

  throw new Error("This archive format is not supported. Choose a ZIP or uncompressed TAR archive.");
}

export async function validateArchivePassword(archive, password) {
  const encryptedEntries = archive.files.filter((richFile) => richFile.source.encrypted);

  try {
    for (const richFile of encryptedEntries) {
      await richFile.source.getData(new zip.Uint8ArrayWriter(), {
        password,
        checkPasswordOnly: true,
      });
    }
  } catch (err) {
    if (err.message === zip.ERR_INVALID_PASSWORD) {
      throw new Error("That password did not open this ZIP file.");
    }
    throw err;
  }
}

export async function readArchiveEntry(richFile, password) {
  if (richFile.format === "zip") {
    return richFile.source.getData(
      new zip.BlobWriter(richFile.info.type),
      password ? { password } : undefined
    );
  }

  return richFile.archiveFile.slice(
    richFile.source.dataOffset,
    richFile.source.dataOffset + richFile.info.size,
    richFile.info.type
  );
}

export async function writeArchiveEntry(richFile, writable, password) {
  if (richFile.format === "zip") {
    await richFile.source.getData(writable, password ? { password } : undefined);
    return;
  }

  await readArchiveEntry(richFile, password).then((blob) => blob.stream().pipeTo(writable));
}

async function openZipArchive(file) {
  const reader = new zip.ZipReader(new zip.BlobReader(file));

  try {
    const entries = await reader.getEntries();
    const files = entries
      .filter((entry) => !entry.directory)
      .map((entry) => createRichFile({
        name: entry.filename,
        size: entry.uncompressedSize,
        format: "zip",
        source: entry,
      }));

    return {
      format: "ZIP",
      files,
      requiresPassword: files.some((richFile) => richFile.source.encrypted),
      close: () => reader.close(),
    };
  } catch (err) {
    await reader.close();
    throw err;
  }
}

async function openTarArchive(file) {
  const files = [];
  let offset = 0;
  let longPath = null;
  let localPax = {};
  let globalPax = {};

  while (offset + TAR_BLOCK_SIZE <= file.size) {
    const header = new Uint8Array(
      await file.slice(offset, offset + TAR_BLOCK_SIZE).arrayBuffer()
    );

    if (isZeroBlock(header)) break;
    if (!isTarHeader(header)) {
      throw new Error("This TAR archive has an invalid or unsupported header.");
    }

    const storedSize = parseTarNumber(header.subarray(124, 136));
    const dataOffset = offset + TAR_BLOCK_SIZE;
    const type = String.fromCharCode(header[156] || 0);
    const headerPath = getTarPath(header);

    if (type === "L") {
      longPath = await readTarText(file, dataOffset, storedSize);
    } else if (type === "x" || type === "g") {
      const pax = await readPaxHeaders(file, dataOffset, storedSize);
      if (type === "g") globalPax = { ...globalPax, ...pax };
      else localPax = pax;
    } else {
      const pax = { ...globalPax, ...localPax };
      const path = longPath || pax.path || headerPath;
      const size = pax.size === undefined ? storedSize : parsePaxSize(pax.size);

      if ((type === "\0" || type === "0" || type === "7") && path) {
        files.push(createRichFile({
          name: path,
          size,
          format: "tar",
          source: { dataOffset },
          archiveFile: file,
        }));
      }

      longPath = null;
      localPax = {};
    }

    offset = dataOffset + Math.ceil(storedSize / TAR_BLOCK_SIZE) * TAR_BLOCK_SIZE;
  }

  if (!files.length) {
    throw new Error("This TAR archive does not contain any regular files.");
  }

  return {
    format: "TAR",
    files,
    requiresPassword: false,
    close: async () => {},
  };
}

function createRichFile({ name, size, format, source, archiveFile }) {
  const normalizedPath = name.replace(/^\.\//, "");
  const split = normalizedPath.split("/");
  const filename = split[split.length - 1];

  return {
    info: {
      name: filename,
      size,
      relativePath: normalizedPath,
      type: getMimeType(filename),
    },
    format,
    source,
    archiveFile,
  };
}

function getArchiveExtension(filename) {
  const lowerFilename = filename.toLowerCase();
  if (lowerFilename.endsWith(".tar.gz")) return ".tar.gz";
  return lowerFilename.slice(lowerFilename.lastIndexOf("."));
}

function hasSignature(header, signature) {
  return signature.every((byte, index) => header[index] === byte);
}

function isGzip(header) {
  return header[0] === 0x1f && header[1] === 0x8b;
}

function isTarHeader(header) {
  if (header.length < TAR_BLOCK_SIZE || isZeroBlock(header)) return false;

  let checksum = 0;
  for (let index = 0; index < TAR_BLOCK_SIZE; index++) {
    checksum += index >= 148 && index < 156 ? 0x20 : header[index];
  }

  return checksum === parseTarNumber(header.subarray(148, 156));
}

function isZeroBlock(block) {
  return block.every((byte) => byte === 0);
}

function parseTarNumber(bytes) {
  if (bytes[0] & 0x80) {
    let value = BigInt(bytes[0] & 0x7f);
    for (const byte of bytes.subarray(1)) value = (value << 8n) + BigInt(byte);
    if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new Error("This TAR archive contains a file that is too large for this browser.");
    }
    return Number(value);
  }

  const value = decodeTarString(bytes).trim();
  if (!value) return 0;

  const parsed = Number.parseInt(value, 8);
  if (Number.isNaN(parsed)) throw new Error("This TAR archive contains an invalid file size.");
  return parsed;
}

function getTarPath(header) {
  const name = decodeTarString(header.subarray(0, 100));
  const prefix = decodeTarString(header.subarray(345, 500));
  return prefix ? `${prefix}/${name}` : name;
}

function decodeTarString(bytes) {
  const end = bytes.indexOf(0);
  return new TextDecoder().decode(end === -1 ? bytes : bytes.subarray(0, end));
}

async function readTarText(file, offset, size) {
  const bytes = new Uint8Array(await file.slice(offset, offset + size).arrayBuffer());
  return decodeTarString(bytes).replace(/\n$/, "");
}

async function readPaxHeaders(file, offset, size) {
  const bytes = new Uint8Array(await file.slice(offset, offset + size).arrayBuffer());
  const headers = {};
  let cursor = 0;

  while (cursor < bytes.length) {
    const space = bytes.indexOf(0x20, cursor);
    if (space === -1) throw new Error("This TAR archive contains invalid PAX metadata.");

    const length = Number.parseInt(new TextDecoder().decode(bytes.subarray(cursor, space)), 10);
    if (!length || cursor + length > bytes.length) {
      throw new Error("This TAR archive contains invalid PAX metadata.");
    }

    const record = new TextDecoder().decode(bytes.subarray(space + 1, cursor + length - 1));
    const separator = record.indexOf("=");
    if (separator !== -1) headers[record.slice(0, separator)] = record.slice(separator + 1);
    cursor += length;
  }

  return headers;
}

function parsePaxSize(value) {
  const size = Number(value);
  if (!Number.isSafeInteger(size) || size < 0) {
    throw new Error("This TAR archive contains an invalid PAX file size.");
  }
  return size;
}

export function getMimeType(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  const mimeTypes = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    bmp: "image/bmp",
    txt: "text/plain",
    md: "text/markdown",
    html: "text/html",
    htm: "text/html",
    css: "text/css",
    csv: "text/csv",
    js: "text/javascript",
    jsx: "text/javascript",
    ts: "text/typescript",
    tsx: "text/typescript",
    json: "application/json",
    xml: "application/xml",
    py: "text/x-python",
    rb: "text/x-ruby",
    java: "text/x-java",
    c: "text/x-c",
    cpp: "text/x-c++",
    h: "text/x-c",
    hpp: "text/x-c++",
    go: "text/x-go",
    rs: "text/x-rust",
    php: "text/x-php",
    sh: "text/x-shellscript",
    bash: "text/x-shellscript",
    zsh: "text/x-shellscript",
    yaml: "text/yaml",
    yml: "text/yaml",
    toml: "text/toml",
    ini: "text/plain",
    conf: "text/plain",
    env: "text/plain",
    pdf: "application/pdf",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
  };
  return mimeTypes[ext] || "application/octet-stream";
}
