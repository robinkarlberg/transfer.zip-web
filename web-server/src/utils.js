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

const __getFileIconFromExtension = (ext) => {
    if (ext == "exe") return "filetype-exe"
    if (ext == "zip" || ext == "tar" || ext == "gz" || ext == "gzip" || ext == "rar") return "file-earmark-zip"
    if (ext == "bin" || ext == "img" || ext == "iso") return "file-earmark-binary"
    if (ext == "js" || ext == "c" || ext == "cpp" || ext == "py" || ext == "java" || ext == "css" || ext == "html" || ext == "xml") return "file-earmark-code"
    if (ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "bmp" || ext == "dng" || ext == "webp") return "file-earmark-image"
    if (ext == "wav" || ext == "mp3" || ext == "flac") return "file-earmark-music"
    if (ext == "pdf") return "file-earmark-pdf"
    if (ext == "mov" || ext == "mp4" || ext == "mkv") return "file-earmark-play"
    if (ext == "docx" || ext == "doc") return "file-earmark-word"
    if (ext == "txt" || ext == "tex") return "file-earmark-text"
}

export const getFileIconFromExtension = (ext) => {
    const bi_ext = __getFileIconFromExtension(ext)
    if (!bi_ext) return null
    else return "bi-" + bi_ext
}

export const groupStatisticsByInterval = (statistics, interval) => {
    // groups contains objects: { name: <new Date(obj.time).toISOString().split('T')[0]>, value: 0 }
    const groups = []

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());

    if (interval === "day") {
        // push the last 24 hours to groups
        for (let i = 0; i < 24; i++) {
            const date = new Date(today);
            date.setHours(date.getHours() - i);
            groups.push({ name: date.getDate() + " " + String(date.getHours()).padStart(2, '0') + ":00", value: 0 });
        }
    } else if (interval === "week") {
        // push the last 7 days to groups
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            groups.push({ name: date.toISOString().split('T')[0], value: 0 });
        }
    } else if (interval === "month") {
        // push the last 30 days to groups
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            groups.push({ name: date.toISOString().split('T')[0], value: 0 });
        }
    } else if (interval === "year") {
        // push the last 12 months to groups
        for (let i = 0; i < 12; i++) {
            const date = new Date(today);
            date.setMonth(date.getMonth() - i);
            groups.push({ name: date.toISOString().split('T')[0].slice(0, 7), value: 0 });
        }
    }
    // console.log(groups)

    statistics.forEach(obj => {
        let key;

        if (interval === 'day') {
            key = new Date(obj.time).getDate() + " " + String(new Date(obj.time).getHours()).padStart(2, '0') + ":00"; // Group by hour in the last 24 hours
        } else if (interval === 'week' || interval === 'month') {
            key = new Date(obj.time).toISOString().split('T')[0]; // Group by day for week or month
        } else if (interval === 'year') {
            key = new Date(obj.time).toISOString().split('T')[0].slice(0, 7); // Group by month for the last year
        }

        const existingGroup = groups.find(x => x.name === key);
        if (existingGroup) {
            // console.log(key)
            existingGroup.value += 1;
        }
    });

    return groups.reverse();
}

export const isSelfHosted = () => {
    return process.env.REACT_APP_SELFHOST && process.env.REACT_APP_SELFHOST == "true"
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function pollForConditionOrThrow(predicateFn, ms, throwAfterMs) {
    console.log("[pollForConditionOrThrow] Start polling...")
    return new Promise((resolve, reject) => {
        let timeoutId = -1
        let thrown = false
        const throwTimeoutId = setTimeout(() => {
            console.log("[pollForConditionOrThrow] throw!")
            thrown = true
            clearInterval(timeoutId)
            reject()
        }, throwAfterMs)
        const pollingFn = () => {
            if(thrown) {
                return
            }
            if (predicateFn()) {
                console.log("[pollForConditionOrThrow] resolve!")
                clearTimeout(throwTimeoutId)
                clearInterval(timeoutId)
                resolve()
            }
            else {
                timeoutId = setTimeout(pollingFn, ms)
            }
        }
        pollingFn()
    })
}