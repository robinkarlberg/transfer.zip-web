# ! DEV BRANCH !

> [!WARNING] 
> This is Work in Progress, not working yet

This is the dev branch for a completely open-source version, with support for you to self-host everything yourself.

It aims to become the best way to setup your own file transfer server, in addition to our managed solution ;)

<img src="https://dev.transfer.zip/img/icon-small.png"></img>

# Transfer.zip

**Transfer.zip:** The open source file-sharing solution. Self-hosteable and without size limits.

> [!NOTE]
> If you do not want to self-host or just try it out for yourself, it is available as a managed service at [Transfer.zip](https://transfer.zip/).

## Features

- End-to-end encrypted peer-to-peer realtime transfers with **no size limits**, meaning you can send **1TB** files if you want.
- Reliable file uploads using the [tus](https://tus.io/) protocol.
- Ability to request others to upload files to you for download later.
- Easy to **self-host** or contribute to the codebase.
- Supports storing files with S3-compatiable APIs as well as local disk storage.

### Quick Transfers - End-to-end encrypted WebRTC file transfers in the browser
Quick Transfers use [WebRTC](http://www.webrtc.org/) for peer-to-peer data transfer, meaning the files are streamed directly between peers and not stored anywhere in the process, not even on Transfer.zip servers. To let peers initially discover each other, a signaling server is implemented in NodeJS using WebSockets, which importantly no sensitive data is sent through. In addition, the file data is end-to-end encrypted using [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) with a client-side 256 bit generated key, meaning if someone could impersonate a peer or capture the traffic, they would not be able to decrypt the file without knowing the key. Because the file is streamed directly between peers, there are **no file size or bandwidth limitations**. The easiest way to Quick Transfer a file is to scan the QR code containing the file link and encryption key. It is also possible to copy the link and share it to the recipient over what medium you prefer the most. 

Because of how peer-to-peer works, some network firewalls may not allow direct connections between devices. In that case, the peer-to-peer connection can fallback to using the signalling server as a relay, effectively bypassing network firewall limitations. Due to WebRTC connections being much slower than using the relay, it will forced to be used if files are larger than 10MB, even if WebRTC connections are technically possible. This change was made due to people complaining of slow transfer speeds.

Quick Transfers only work while both users are online at the same time, due to the peer-to-peer nature of the system. 

### Cloud Transfers - File uploads with resumable, scalable storage
Instead of real-time peer-to-peer transfer like with Quick Transfers, Cloud Transfers store the file temporarily on your server (or S3-compatible backend) using the [tus](https://tus.io/) protocol, which supports resumable, chunked uploads. This means interrupted uploads or downloads can continue where they left off. Files are deleted after the transfers expiry date.

Cloud Transfers are just what normal file transfer services like WeTransfer do, but you can host it yourself.

To set up Cloud Transfers, you need to spin up a [node server](https://github.com/robinkarlberg/transfer.zip-node) and configure it. Having seperate servers handling the heavy-duty stuff like uploads and zip bundles, keeps the main site running smoothly. It also enables distributing of several node servers around the world, close to users, to optimize download times.

## Known Problems

0-byte files gets stuck on transmit using Quick Transfers.

On Firefox mobile, sending files using Quick Transfer does not work at the moment. This could have something to do with the path being changed after the file has been chosen in the file picker, but not been read yet. This is under investigation and idk how to fix.

Sending files from some Safari browsers is buggy at the moment, it has something to do with Safari terminating the WebSocket connection when unfocusing the window. Apple...

## Self-Hosting

> [!NOTE]
> Self-hosting of Stored Transfers is experimental at the moment. Please report any issues in this GitHub repo.

To setup self-hosting, run  `./createenv.sh` to create the env-files needed. This will enable only the core features for Quick Share and the relay to function.

Then, to build and deploy transfer.zip, use docker compose.
```
docker compose build && docker compose up
```
This will by default listen for connections on `localhost:9001`, the signaling server will be proxied through the web-server on the `/ws` endpoint on the same port. When self-hosting, it is recommended to put transfer.zip behind a reverse-proxy with https.
For Apache, the configuration needs to include these lines for the reverse proxy to function:
```
ProxyPreserveHost On

ProxyPass /ws ws://localhost:9001/ws
ProxyPassReverse /ws ws://localhost:9001/ws

ProxyPass / http://localhost:9001/
ProxyPassReverse / http://localhost:9001/
```

For NGINX:
```
# Put this at the top
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

# Put this in your server-block
# server {
# ...
    location /ws {
        proxy_pass http://localhost:9001/ws;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
    }
# ...
# }
```

For Caddy (Thanks [7MinSec](https://github.com/7MinSec)):
```
zip.yourdomain.com {
    reverse_proxy 127.0.0.1:9001

    log {
        output file /var/log/caddy/zip.log
    }
}
```

### Get public key

While the worker container is running:
`docker compose exec worker cat /worker_data/public.pem`

## Local Development and Contributing
> [!NOTE]
> This project is tested with Docker Compose V2. Docker Compose V1 will most likely fail to build.

When developing, install all dependencies with `./setup.sh`. Then run the `local-dev.sh` script, it will start the signalling server and the web server for you.
```
./local-dev.sh
```

## Built with

- Next.js
- WebRTC
- WebSockets
- Node.js
- ExpressJS
- MongoDB
- zip.js

## License

This project is licensed under the [Business Source License 1.1](./LICENSE), with a 3-year change date to MIT.

Basically, you may self-host and use it internally or with clients, but just not offer a competing file transfer service.

See [LICENSE](./LICENSE) for details.
