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

    switch (ext) {
        case "aac": return "filetype-aac";
        case "ai": return "filetype-ai";
        case "bmp": return "filetype-bmp";
        case "cs": return "filetype-cs";
        case "css": return "filetype-css";
        case "csv": return "filetype-csv";
        case "doc": return "filetype-doc";
        case "docx": return "filetype-docx";
        case "exe": return "filetype-exe";
        case "gif": return "filetype-gif";
        case "heic": return "filetype-heic";
        case "html": return "filetype-html";
        case "java": return "filetype-java";
        case "jpg":
        case "jpeg": return "filetype-jpg";
        case "js": return "filetype-js";
        case "json": return "filetype-json";
        case "jsx": return "filetype-jsx";
        case "key": return "filetype-key";
        case "m4p": return "filetype-m4p";
        case "md": return "filetype-md";
        case "mdx": return "filetype-mdx";
        case "mov": return "filetype-mov";
        case "mp4": return "filetype-mp4";
        case "otf": return "filetype-otf";
        case "pdf": return "filetype-pdf";
        case "php": return "filetype-php";
        case "png": return "filetype-png";
        case "ppt": return "filetype-ppt";
        case "pptx": return "filetype-pptx";
        case "psd": return "filetype-psd";
        case "py": return "filetype-py";
        case "raw": return "filetype-raw";
        case "rb": return "filetype-rb";
        case "sass": return "filetype-sass";
        case "scss": return "filetype-scss";
        case "sh": return "filetype-sh";
        case "sql": return "filetype-sql";
        case "svg": return "filetype-svg";
        case "tiff": return "filetype-tiff";
        case "tsx": return "filetype-tsx";
        case "ttf": return "filetype-ttf";
        case "txt": return "filetype-txt";
        case "woff": return "filetype-woff";
        case "xls": return "filetype-xls";
        case "xlsx": return "filetype-xlsx";
        case "xml": return "filetype-xml";
        case "yml": return "filetype-yml";
        case "zip":
        case "tar":
        case "gz":
        case "gzip":
        case "rar": return "file-earmark-zip";
        case "bin":
        case "img":
        case "iso": return "file-earmark-binary";
        case "c":
        case "cpp": return "file-earmark-code";
        case "dng":
        case "webp": return "file-earmark-image";
        case "wav":
        case "mp3":
        case "flac": return "file-earmark-music";
        case "mkv": return "file-earmark-play";
        case "tex": return "file-earmark-text";
        default: return "file-earmark";
    }
}

export const getFileIconFromExtension = (ext) => {
    const bi_ext = __getFileIconFromExtension(ext)
    return "bi-" + bi_ext
}

export const getFileExtension = (filename) => {
    const split = filename.split(".")
    if (split.length == 0) return null
    return split[split.length - 1]
}

export const groupStatisticsByInterval = (statistics, interval) => {
    // groups contains objects: { name: <new Date(obj.time).toISOString().split('T')[0]>, value: 0 }
    if(!statistics) return []
    console.log(statistics)
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
    return process.env.REACT_APP_SELFHOST == undefined || (process.env.REACT_APP_SELFHOST && process.env.REACT_APP_SELFHOST == "true")
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
            if (thrown) {
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

export const readFileTillEnd = async (file, cbData) => {
    return new Promise((resolve, reject) => {
        let offset = 0

        const readSlice = async o => {
            const fileSliceBuffer = await file.slice(offset, o + 16384 * 10).arrayBuffer()

            cbData(new Uint8Array(fileSliceBuffer))
            offset += fileSliceBuffer.byteLength;

            if (offset < file.size) {
                readSlice(offset);
            }
            else {
                resolve()
            }
        };
        readSlice(0)
    })
}

export function buildNestedStructure(files) {
    if (!files) return null

    const root = { directories: [], files: [] };

    files.forEach(file => {
        const parts = (file.info.relativePath || file.info.name).split('/');
        let current = root;

        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                // This is a file, add it to the current directory's files array
                current.files.push({ ...file, info: { ...file.info, name: getFileNameFromPath(file.info.name) } });
            } else {
                // This is a directory
                let dir = current.directories.find(d => d.name === part + "/");
                if (!dir) {
                    // If the directory does not exist, create it
                    dir = { name: part + "/", directories: [], files: [] };
                    current.directories.push(dir);
                }
                current = dir; // Move to the found or created directory
            }
        });
    });

    return root;
}

export function removeLastEntry(path) {
    const parts = path.split('/');
    if (parts.pop() == "") {
        parts.pop();
    }
    return parts.join('/').replace(/\/+$/, '') + "/";
}

export function getFileNameFromPath(path) {
    return path.split('/').pop();
}