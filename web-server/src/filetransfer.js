/* global BigInt */

import streamSaver from "./lib/StreamSaver"
import { decodeString, encodeString } from "./utils"
streamSaver.mitm = "./mitm.html"

const FILE_CHUNK_SIZE = 16384
const FILE_STREAM_SIZE = 32

const PACKET_ID = {
    newFile: 0,
    fileData: 1,
    fileList: 2,
    error: 9
}

const genIV = () => {
    const iv = new Uint8Array(12)
    crypto.getRandomValues(iv)
    // const dataview = new DataView(iv.buffer)
    // dataview.setBigUint64(0, BigInt(i))
    return iv
}

const getJwkFromK = async (k) => {
    const key = await crypto.subtle.importKey("jwk", {
        alg: "A256GCM",
        ext: true,
        k,
        kty: "oct",
        key_ops: ["encrypt", "decrypt"]
    }, { name: "AES-GCM" }, false, ["encrypt", "decrypt"])
    return key
}

// /**
//  * List containing all FileTransfer instances
//  */
// let activeFileTransfers = []

// export const newFileTransfer = (channel, key) => {
//     const fileTransfer = new FileTransfer(channel, key)
//     activeFileTransfers.push(fileTransfer)
//     return fileTransfer
// }

// export const removeFileTransfer = (fileTransfer) => {
//     activeFileTransfers = activeFileTransfers.filter(o => o !== fileTransfer)
// }

class FileTransferFile {
    onprogress = undefined
    onfilefinished = undefined

    chunkMap = new Map()
    chunkIndex = -1
    writer = undefined
    bytesRecieved = 0
    fileInfo = undefined

    constructor(fileTransfer, onprogress, onfilefinished) {
        this.fileTransfer = fileTransfer
        this.onprogress = onprogress
        this.onfilefinished = onfilefinished
    }

    setFileInfo(fileInfo) {
        console.log("Set file info", fileInfo)
        const fileStream = streamSaver.createWriteStream(fileInfo.name, {
            size: fileInfo.size
        })
        this.fileInfo = fileInfo
        this.writer = fileStream.getWriter()
    }

    isFileInfoSet() {
        return this.fileInfo != undefined
    }

    isFileTransferDone() {
        return this.isFileInfoSet() && this.bytesRecieved == this.fileInfo.size && this.chunkMap.size == 0
    }

    checkProgress = () => {
        let isFileTransferDone = this.isFileTransferDone()

        this.onprogress({ now: this.bytesRecieved, max: this.fileInfo.size, done: isFileTransferDone }, this.fileInfo)

        if (isFileTransferDone) {
            console.log("[FileTransferFile] File has been received!")
            this.onfilefinished(this.fileInfo)
        }
    }

    handleChunkMap = () => {
        if (!this.writer) {
            console.error("writer undefined")
            return
        }
        if (this.writer.desiredSize == null) {
            console.error("user canceled download")
            this.fileTransfer.sendData(JSON.stringify({ type: "error", message: "cancel" }))
            this.channel.close()
            throw new Error("user cancelled the download")
        }
        if (!this.fileInfo) {
            console.error("fileInfo undefined")
            return
        }
        while (true) {
            const data = this.chunkMap.get(this.chunkIndex + 1)
            if (!data) break
            // console.log(data)
            this.chunkMap.delete(this.chunkIndex + 1)
            this.chunkIndex++
            this.writer.write(data)
        }
        if (this.bytesRecieved == this.fileInfo.size && this.chunkMap.size == 0) {
            console.log("Close writer")
            this.writer.close()
            this.checkProgress()
        }
    }

    setChunkMap(index, data) {
        this.chunkMap.set(index, data)

        this.bytesRecieved += data.byteLength
        this.handleChunkMap()
        this.checkProgress()
    }
}

export class FileTransfer {
    onprogress = undefined
    onfilefinished = undefined

    packetIndex = 0
    currentFile = undefined

    constructor(channel, key) {
        console.log("[FileTransfer] created with key ", key)
        this.channel = channel
        this.key = key
    }

    async sendData(data) {
        this.channel.send(data)
    }

    async encryptData(data) {
        const iv = genIV()

        const encryptedPacket = await crypto.subtle.encrypt({
            "name": "AES-GCM", "iv": iv
        }, this.key, data);

        const encryptedPacketAndIV = new Uint8Array(encryptedPacket.byteLength + 12)
        encryptedPacketAndIV.set(iv)
        encryptedPacketAndIV.set(new Uint8Array(encryptedPacket), 12)
        return encryptedPacketAndIV
    }

    async decryptData(__data) {
        const iv = new Uint8Array(__data.slice(0, 12))
        const encryptedPacket = __data.slice(12)

        const packet = new Uint8Array(await crypto.subtle.decrypt({
            "name": "AES-GCM", "iv": iv
        }, this.key, encryptedPacket));

        return packet
    }

    sendFile(file) {
        let offset = 0
        let fileReader = new FileReader()
        fileReader.onload = async e => {
            const __data = fileReader.result

            const packet = new Uint8Array(1 + 8 + __data.byteLength)
            const packetDataView = new DataView(packet.buffer)
            packetDataView.setInt8(0, PACKET_ID.fileData)
            packetDataView.setBigUint64(1, BigInt(offset))
            packet.set(new Uint8Array(__data), 1 + 8)

            this.sendData(await this.encryptData(packet))
            offset += __data.byteLength;

            if (offset < file.info.size) {
                readSlice(offset);
            }
        }
        fileReader.onerror = e => {
            console.error("File reader error", e)
        }
        fileReader.onabort = e => {
            console.log("File reader abort", e)
        }
        const readSlice = o => {
            if (this.channel.bufferedAmount > 5000000) {
                return setTimeout(() => { readSlice(o) }, 1)
            }
            const slice = file.nativeFile.slice(offset, o + FILE_CHUNK_SIZE);
            fileReader.readAsArrayBuffer(slice);
        };

        const fileInfo = {
            name: file.info.name,
            size: file.info.size,
            type: file.info.type
        }
        const fileInfoStr = JSON.stringify(fileInfo)
        const fileInfoBytes = encodeString(fileInfoStr)
        console.log("[FileTransfer] Sending file info:", fileInfoStr, fileInfoBytes)

        const packet = new Uint8Array(1 + fileInfoBytes.byteLength)
        const packetDataView = new DataView(packet.buffer)
        packetDataView.setInt8(0, PACKET_ID.newFile)
        packet.set(fileInfoBytes, 1)

        this.encryptData(packet).then(encryptedPacket => {
            this.channel.__currentFileInfo = fileInfo
            this.sendData(encryptedPacket)
            readSlice(0)
        })
    }

    serveFiles(files) {
        console.debug("[FileTransfer] Serving Files...", files)
        this.channel.addEventListener("message", async e => {
            const textDec = new TextDecoder()
            const dataStr = textDec.decode(await this.decryptData(e.data))
            const data = JSON.parse(dataStr)

            if (data.type == "progress") {
                console.log("[FileTransfer] Got progress:", data)
                this.onprogress({ now: data.now, max: data.max, done: data.done }, this.channel.__currentFileInfo)
                if (data.done) {
                    this.onfilefinished(this.channel.__currentFileInfo)
                }
            }
            else if (data.type == "error") {
                if (data.message == "cancel") {
                    throw new Error("User canceled the download")
                }
                else {
                    console.error("Unknown error message:", data)
                }
            }
            else if (data.type == "list") {
                console.log("[FileTransfer] Got list file request:", data)
                const fileList = files.map(x => {
                    return { info: { name: x.info.name, size: x.info.size, type: x.info.type } }
                })
                
                const fileListBytes = encodeString(JSON.stringify(fileList))
                console.log("[FileTransfer] Sending file list:", fileList, fileListBytes)
        
                const packet = new Uint8Array(1 + fileListBytes.byteLength)
                const packetDataView = new DataView(packet.buffer)
                packetDataView.setInt8(0, PACKET_ID.fileList)
                packet.set(fileListBytes, 1)

                this.encryptData(packet).then(encryptedPacket => {
                    this.sendData(encryptedPacket)
                })
            }
            else if (data.type == "download") {
                console.log("[FileTransfer] Got download file request:", data)
                const fileIndexToDownload = data.index
                this.sendFile(files[fileIndexToDownload])
            }
        })
    }

    requestFile(fileListIndex) {
        this.encryptData(encodeString(JSON.stringify({ type: "download", index: fileListIndex }))).then(encryptedData => {
            this.sendData(encryptedData)
        })
    }

    queryForFiles(cbFileList) {
        console.log("[FileTransfer] queryForFiles")

        const onprogress = async (progress, fileInfo) => {
            if ((progress.now / FILE_CHUNK_SIZE) % 50 == 49) {
                console.log("[FileTransfer] send progress:", progress)
                this.sendData(await this.encryptData(encodeString(JSON.stringify(progress))))
            }
            this.onprogress(progress, fileInfo)
        }

        const onfilefinished = (fileInfo) => {
            this.onfilefinished(fileInfo)
            this.currentFile = new FileTransferFile(this.channel, onprogress, onfilefinished)
        }

        this.currentFile = new FileTransferFile(this.channel, onprogress, onfilefinished)

        this.channel.addEventListener("message", async e => {
            const packet = await this.decryptData(e.data)
            const packetDataView = new DataView(packet.buffer)
            const packetId = packetDataView.getInt8(0)

            if (packetId == PACKET_ID.newFile) {   // new file
                const data = packet.slice(1)
                const fileInfo = JSON.parse(decodeString(data))

                if (this.currentFile.isFileInfoSet()) {
                    console.error("fileInfo received twice !!!!!!!!!!!", fileInfo)
                    throw new Error("fileInfo received twice !!!!!!!!!!!")
                }

                // if (!this.currentFile.isFileTransferDone()) {
                //     console.error("file transfer is not finished yet !!!!!!!!!!!", fileInfo)
                //     throw new Error("file transfer is not finished yet !!!!!!!!!!!")
                // }

                if (this.currentFile.isFileTransferDone()) {     // actually new file
                    console.error("New file transfer :)")
                    this.currentFile = new FileTransferFile(this.channel, onprogress, onfilefinished)
                }
                console.log("Got file info:", fileInfo)

                this.currentFile.setFileInfo(fileInfo)

                this.currentFile.handleChunkMap()	// if packet is received after all file data for some reason
            }
            else if (packetId == PACKET_ID.fileData) {
                const offset = Number(packetDataView.getBigUint64(1))
                const data = packet.slice(1 + 8)

                const index = offset / FILE_CHUNK_SIZE

                this.currentFile.setChunkMap(index, data)
            }
            else if(packetId == PACKET_ID.fileList) {
                const data = packet.slice(1)
                const fileList = JSON.parse(decodeString(data))
                cbFileList(fileList)
            }
        })

        this.encryptData(encodeString(JSON.stringify({ type: "list" }))).then(encryptedData => {
            this.sendData(encryptedData)
        })
    }
}