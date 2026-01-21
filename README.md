# Transfer.zip

<a href="https://transfer.zip"><img width="40%" alt="image" align="right" src="https://github.com/user-attachments/assets/eebc557d-f244-4116-8a6c-f07eeb8aee23" /></a>

This is the GitHub repository for [Transfer.zip](https://transfer.zip/) - a beautiful and open-source file transfer alternative to popular services like *WeTransfer*, *WeTransfer* and more.

This repository contains the source code for the website and database. The other repo, [transfer.zip-node](https://github.com/robinkarlberg/transfer.zip-node) controls all file operations.

A LOT of work has gone into making this tool, we are so grateful for all the support we have gotten along the way.

**Support us by signing up for a free trial: [Transfer.zip Pricing](https://transfer.zip/#pricing)**

---

## Features
A quick overview of the main features, more info further down.
- **Reliable uploads** - File uploads use the reliable [tus](https://tus.io/) protocol.
- **Transfer requests** - Ability to request others to upload files to you for download later.
- **Custom branding** - Upload your own icon and background for the transfer pages (requires an S3 bucket atm)
- **Email support** - Send emails to recipients, also updates to fit with the branding.
- **S3/Disk stored transfers** - Supports storing files with S3-compatiable APIs as well as local disk storage.
- **Quick Transfers** - End-to-end encrypted peer-to-peer transfers, when you don't want to store files, just send them.
- **Self-hostable** - Easy to **self-host** on your own hardware.

<img src="https://cdn.transfer.zip/img/high-level-architecture.png?" width="650"></img>

> [!NOTE]
> The "main" branch is inteded for self-hosting. The "production" branch is the code that runs in production. They can differ when we have not ported all functionality yet to the self-hosted version.

### Quick Transfers - End-to-end encrypted WebRTC file transfers in the browser
Quick Transfers use [WebRTC](http://www.webrtc.org/) for peer-to-peer data transfer, meaning the files are streamed directly between peers and not stored anywhere in the process, not even on Transfer.zip servers. To let peers initially discover each other, a signaling server is implemented in NodeJS using WebSockets, which importantly no sensitive data is sent through. In addition, the file data is end-to-end encrypted using [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) with a client-side 256 bit generated key, meaning if someone could impersonate a peer or capture the traffic, they would not be able to decrypt the file without knowing the key. Because the file is streamed directly between peers, there are **no file size or bandwidth limitations**. The easiest way to Quick Transfer a file is to scan the QR code containing the file link and encryption key. It is also possible to copy the link and share it to the recipient over what medium you prefer the most. 

Because of how peer-to-peer works, some network firewalls may not allow direct connections between devices. In that case, the peer-to-peer connection can fallback to using the signalling server as a relay, effectively bypassing network firewall limitations. Due to WebRTC connections being much slower than using the relay, it will forced to be used if files are larger than 10MB, even if WebRTC connections are technically possible. This change was made due to people complaining of slow transfer speeds.

Quick Transfers only work while both users are online at the same time, due to the peer-to-peer nature of the system. 

### Stored Transfers - File uploads with resumable, scalable storage
Instead of real-time peer-to-peer transfer like with Quick Transfers, Stored Transfers store the file temporarily on the server (or S3-compatible backend) using the [tus](https://tus.io/) protocol, which supports resumable, chunked uploads. This means interrupted uploads or downloads can retry on network interruptions. Files are permanently deleted after the transfers expiry date.

Stored Transfers are just what normal file transfer services like WeTransfer do, but you can host it yourself if you want. 

## Self-hosting

See the [self-hosting guide](SELFHOSTING.md).

## Built with

- Next.js
- WebRTC
- WebSockets
- Node.js
- Fastify
- MongoDB
- zip.js

## Some known problems

0-byte files gets stuck on transmit using Quick Transfers.

On Firefox mobile, sending files using Quick Transfer does not work at the moment. This could have something to do with the path being changed after the file has been chosen in the file picker, but not been read yet. This is under investigation and idk how to fix.

Sending files from some Safari browsers is buggy at the moment, it has something to do with Safari terminating the WebSocket connection when unfocusing the window. Apple...
