const FILE_CHUNK_SIZE = 16384
const FILE_STREAM_SIZE = 32

const PACKET_ID = {
	fileInfo: 0,
	fileData: 1,
	error: 9
}

const genIV = (i) => {
	const iv = new Uint8Array(12)
	const dataview = new DataView(iv.buffer)
	dataview.setBigUint64(0, BigInt(i + 1))
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

/**
 * List containing all FileTransfer instances
 */
let activeFileTransfers = []

const newFileTransfer = (channel, key) => {
    const fileTransfer = new FileTransfer(channel, key)
    activeFileTransfers.push(fileTransfer)
    return fileTransfer
}

const removeFileTransfer = (fileTransfer) => {
    activeFileTransfers = activeFileTransfers.filter(o => o !== fileTransfer)
}

class FileTransfer {
    packetIndex = 0

    constructor(channel, key) {
        this.channel = channel
        this.key = key
    }

    async sendAndEncryptPacket(packet) {
        // TODO: Set this to random int when reusing key over multiple files
        const iv = genIV(this.packetIndex++)
    
        const encryptedPacket = await crypto.subtle.encrypt({
            "name": "AES-GCM", "iv": iv
        }, this.key, packet);
    
        const encryptedPacketAndIV = new Uint8Array(encryptedPacket.byteLength + 12)
        encryptedPacketAndIV.set(iv)
        encryptedPacketAndIV.set(new Uint8Array(encryptedPacket), 12)
        // console.log(encryptedPacketAndIV)
        // console.log(encryptedPacket)
        this.channel.send(encryptedPacketAndIV)
    }
    
    async sendFile(file, cbProgress, cbFinished) {
        console.debug("sendFile")
        this.channel.addEventListener("message", async e => {
            const data = JSON.parse(e.data)
            if(data.type == "progress") {
                cbProgress({ now: data.now, max: file.size })
                if(data.now == file.size) {
                    cbFinished()
                }
            }
            else if(data.type == "error") {
                throw data.message
            }
        })

        let offset = 0
        let fr = new FileReader()
        fr.onload = async e => {
            const __data = fr.result

            const packet = new Uint8Array(1 + 8 + __data.byteLength)
            const packetDataView = new DataView(packet.buffer)
            packetDataView.setInt8(0, PACKET_ID.fileData)
            packetDataView.setBigUint64(1, BigInt(offset))
            packet.set(new Uint8Array(__data), 1 + 8)

            await this.sendAndEncryptPacket(packet)
            offset += __data.byteLength;
            // cbProgress({ now: offset, max: file.size })
            // console.log(offset + "/" + file.size)
            if (offset < file.size) {
                readSlice(offset);
            }
        }
        fr.onerror = e => {
            console.error("File reader error", e)
        }
        fr.onabort = e => {
            console.log("File reader abort", e)
        }
        const readSlice = o => {
            // console.log("readSlice", o)

            if(this.channel.bufferedAmount > 5000000) {
                //console.log("WAIT", channel.bufferedAmount)
                return setTimeout(() => { readSlice(o) }, 1)
            }
            //console.log("READ", this.channel.bufferedAmount)

            const slice = file.slice(offset, o + FILE_CHUNK_SIZE);
            fr.readAsArrayBuffer(slice);
        };
        const fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type
        }
        const fileInfoStr = JSON.stringify(fileInfo)
        const textEnc = new TextEncoder()
        const fileInfoBytes = textEnc.encode(fileInfoStr)
        console.log("Sending file info:", fileInfoStr, fileInfoBytes)

        const packet = new Uint8Array(1 + fileInfoBytes.byteLength)
        const packetDataView = new DataView(packet.buffer)
        packetDataView.setInt8(0, PACKET_ID.fileInfo)
        packet.set(fileInfoBytes, 1)

        await this.sendAndEncryptPacket(packet)
        readSlice(0)
    }

    async recvFile(cbProgress, cbFinished) {
        console.debug("recvFile")
        let chunkMap = new Map()
        let chunkIndex = -1
        let writer = undefined
        let bytesRecieved = 0
        let fileInfo = undefined
    
        const handleChunkMap = () => {
            if (!writer) {
                console.error("writer undefined")
                return
            }
            if (writer.desiredSize == null) {
                console.error("user canceled download")
                this.channel.close()
                return
            }
            if (!fileInfo) {
                console.error("fileInfo undefined")
                return
            }
            while (true) {
                const data = chunkMap.get(chunkIndex + 1)
                if (!data) break
                chunkMap.delete(chunkIndex + 1)
                chunkIndex++
                writer.write(data)
            }
            if (bytesRecieved == fileInfo.size) {
                console.log("Close writer")
                writer.close()
            }
        }
        this.channel.addEventListener("message", async e => {
            const __data = e.data
            const iv = new Uint8Array(__data.slice(0, 12))
            const encryptedPacket = __data.slice(12)
    
            const packet = new Uint8Array(await crypto.subtle.decrypt({
                "name": "AES-GCM", "iv": iv
            }, this.key, encryptedPacket));
    
            const packetDataView = new DataView(packet.buffer)
            const packetId = packetDataView.getInt8(0)
    
            if (packetId == PACKET_ID.fileInfo) {
                const data = packet.slice(1)
    
                const textDec = new TextDecoder()
                const fileInfoStr = textDec.decode(data)
                const _fileInfo = JSON.parse(fileInfoStr)
                fileInfo = _fileInfo
                console.log("Got file info:", fileInfo)
    
                const fileStream = streamSaver.createWriteStream(fileInfo.name, {
                    size: fileInfo.size
                })
                writer = fileStream.getWriter()
                handleChunkMap()	// if packet is received after all file data for some reason
            }
            else if (packetId == PACKET_ID.fileData) {
                const offset = Number(packetDataView.getBigUint64(1))
                const data = packet.slice(1 + 8)
    
                const index = offset / FILE_CHUNK_SIZE
                chunkMap.set(index, data)
    
                bytesRecieved += data.byteLength
                handleChunkMap()
    
                let fileReceived = bytesRecieved == fileInfo.size
    
                // TODO: This could be improved by taking into account the file size
                if(index % 50 == 49 || fileReceived) {
                    this.channel.send(JSON.stringify({ type: "progress", now: bytesRecieved }))
                }
    
                cbProgress({ now: bytesRecieved, max: fileInfo.size })
    
                if (fileReceived) {
                    console.log("File has been received!")
                    cbFinished()
                }
            }
        })
    }
}