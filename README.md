# transfer.zip
A self-hostable web application that allows you to easily transfer files between devices **with no size limit**. Also available on, you guessed it, [https://transfer.zip](https://transfer.zip/).

As a hobby music producer, I often needed to share large WAVs, but existing services didn't really do it for me. Discord's 50MB limit was frustrating, and Google Drive, MEGA, Dropbox etc. felt cumbersome, so I started making transfer.zip. I rarely need to save my transfered files permanently, I just want to transfer them, and I think many others do too. Because the Quick Share feature never stores the files anywhere, there are **no file size or bandwidth limitations**!

Transfer.zip is easy to set up locally, to self-host or contribute to the codebase. 

## Features

### Quick Share - End-to-end encrypted WebRTC file transfers in the browser
Quick Share uses [WebRTC](http://www.webrtc.org/) for peer-to-peer data transfer, meaning the files are streamed directly between peers and not stored anywhere in the process, not even on transfer.zip servers. To let peers initially discover each other, a signaling server is implemented in NodeJS using WebSockets, which importantly no sensitive data is sent through. In addition, the file data is end-to-end encrypted using [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) with a client-side 256 bit generated key, meaning if someone could impersonate a peer or capture the traffic, they would not be able to decrypt the file without knowing the key. Because the file is streamed directly between peers, there are **no file size or bandwidth limitations**. The easiest way to Quick Share a file is to scan the QR code containing the file link and encryption key. It is also possible to copy the link and share it to the recipient over what medium you prefer the most. 

### Quick Share Relay - For when WebRTC is blocked

Because of how peer-to-peer works, some network firewalls may not allow direct connections between devices. In that case, the peer-to-peer connection can fallback to using the signalling server as a relay, effectively bypassing network firewall limitations. 

### Transfers

Transfer.zip also supports permanent file transfers, but currently not on the self-hosted version. That could be enabled in the future by making the API open source and self-hostable.

## Known Problems

On Firefox mobile, sending files using Quick Share does not work at the moment. This could have something to do with the path being changed after the file has been chosen in the file picker, but not been read yet. This is under investigation.

## Self-Hosting
To setup self-hosting, change the line `REACT_APP_SELFHOST=false` to `true`, in the `web-server/.env` file. This will enable only the core features for Quick Share and the relay to function.

Then, to build and deploy transfer.zip, use docker compose.
```
docker compose build && docker compose up
```
This will listen for connections on `localhost:9001`, the signaling server will be proxied through the web-server on the `/ws` endpoint on the same port. When self-hosting, it is recommended to put transfer.zip behind a reverse-proxy with https.
For Apache, the configuration needs to include these lines for the reverse proxy to function:
```
ProxyPass /ws ws://localhost:9001/ws
ProxyPassReverse /ws ws://localhost:9001/ws

ProxyPass / http://localhost:9001/
ProxyPassReverse / http://localhost:9001/
```

## Local Development and Contributing
> [!NOTE]
> This project is tested with Docker Compose V2. Docker Compose V1 will most likely fail to build.

When developing, run the `dev.sh` script. It will start the signalling server and the web server for you.
```
./dev.sh
```







