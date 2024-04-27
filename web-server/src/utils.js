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
export function humanFileSize(bytes, si = false, dp = 1) {
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

export function humanFileSizePair(bytes, si = false, dp = 1) {
    const [ amount, unit ] = humanFileSize(bytes, si, dp).split(" ")
    return { amount, unit }
}

export const getTransferLink = (transfer) => {
    const k = transfer.k || ""
    return `${window.location.origin}/dl/${transfer.secretCode}#${k}`
}

export const copyTransferLink = async (transfer) => {
    await navigator.clipboard.writeText(await getTransferLink(transfer))
}

const textEnc = new TextEncoder()
const textDec = new TextDecoder()

export const encodeString = (str) => {
    return textEnc.encode(str)
}
export const decodeString = (str) => {
    return textDec.decode(str)
}

const __getFileIconFromExtension = (ext) => {
    if(ext == "exe") return "filetype-exe"
    if(ext == "zip" || ext == "tar" || ext == "gz" || ext == "gzip" || ext == "rar") return "file-earmark-zip"
    if(ext == "bin" || ext == "img" || ext == "iso") return "file-earmark-binary"
    if(ext == "js" || ext == "c" || ext == "cpp" || ext == "py" || ext == "java" || ext == "css" || ext == "html" || ext == "xml") return "file-earmark-code"
    if(ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "bmp" || ext == "dng" || ext == "webp") return "file-earmark-image"
    if(ext == "wav" || ext == "mp3" || ext == "flac") return "file-earmark-music"
    if(ext == "pdf") return "file-earmark-pdf"
    if(ext == "mov" || ext == "mp4" || ext == "mkv") return "file-earmark-play"
    if(ext == "docx" || ext == "doc") return "file-earmark-word"
    if(ext == "txt" || ext == "tex") return "file-earmark-text"
}

export const getFileIconFromExtension = (ext) => {
    const bi_ext = __getFileIconFromExtension(ext)
    if(!bi_ext) return null
    else return "bi-" + bi_ext
}