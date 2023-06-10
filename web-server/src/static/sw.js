const log = x => {
    console.log("[SW]", x)
}

self.addEventListener("install", e => {
    self.skipWaiting();
    log("install")
})

self.addEventListener("activate", e => {
    log("activate")
})

const FILE_CHUNK_SIZE = 16384

// let messageListenerId
// let fetchListenerId

let chunkMap = new Map()
let chunkIndex = -1
let transStream = undefined
let writer = undefined
let fileInfo = undefined
let bytesRecieved = 0

const reload = () => {
    chunkMap = new Map()
    chunkIndex = -1
    transStream = undefined
    writer = undefined
    fileInfo = undefined
    bytesRecieved = 0
}

const handleChunkMap = () => {
    if (!transStream) {
        console.error("Trans stream not loaded")
        return
    }
    while (true) {
        const chunk = chunkMap.get(chunkIndex + 1)
        if (!chunk) break
        chunkMap.delete(chunkIndex + 1)
        chunkIndex++
        writer.write(chunk)
    }
    if (bytesRecieved == fileInfo.size) {
        log("File transfer complete!")
        writer.close()
    }
}

const interceptFileDownload = async (e) => {
    transStream = new TransformStream()
    writer = transStream.writable.getWriter()
    handleChunkMap()
    return new Response(transStream.readable, {
        //maybe xss here by messing with Content-Disposition so that "attachment" it isn't interpreted, and uploading html with Content-Type text/html ????? //TODO: test if it is possible
        headers: {
            "Content-Type": fileInfo?.type || "application/octet-stream",
            "Content-Disposition": "attachment; filename=\"" + fileInfo?.name || "error.raw" + "\""
        }
    })
}

const handleMessage = e => {
    const message = e.data
    if (message.type == 0) {
        fileInfo = message.fileInfo
        log("Got file info: ")
        log(fileInfo)
    }
    else if (message.type == 1) {
        // log("Got file data: ")
        // log(message)
        for (let chunk of message.dataBuffer) {
            const [offset, data] = chunk
            const index = offset / FILE_CHUNK_SIZE
            chunkMap.set(index, data)
            bytesRecieved += data.byteLength
            if (data.byteLength != FILE_CHUNK_SIZE) {
                console.log("[SW]", bytesRecieved, fileInfo.size)
            }
            handleChunkMap()
        }
    }
    else if(message.type == 2) {
        reload()
    }
}

const handleFetch = e => {
    log("fetch")
    e.respondWith(interceptFileDownload(e))
}

addEventListener("message", handleMessage)
addEventListener("fetch", handleFetch)