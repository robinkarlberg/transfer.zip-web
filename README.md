# transfer.zip
[transfer.zip](https://transfer.zip/) is a web application that allows you to easily transfer files between two devices. At the moment, transfer.zip is the easiest and most secure way to share files on the web.  There is no signup, no wait and no bullshit, and the files can be as large as you want. 

It uses [WebRTC](http://www.webrtc.org/) for peer-to-peer data transfer, meaning the files are streamed directly between peers and not stored anywhere in the process, not even on transfer.zip servers. To let peers initially discover each other, a signaling server is implemented in NodeJS using WebSockets, which importantly no sensitive data is sent through. In addition, the file data is end-to-end encrypted using [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode) with a client-side 256 bit generated key, meaning if someone could impersonate a peer or capture the traffic, they would not be able to decrypt the file without knowing the key. Because the file is streamed directly between peers, there are **no file size or bandwidth limitations**. 

The easiest way to transfer a file is to scan the QR code containing the file link and encryption key. It is also possible to copy the link and share it to the receiving end over what medium you prefer the most. 

## Known Problems

Because of how peer-to-peer works, some network firewalls may not allow direct connections between devices. A solution for this is to use a [TURN server](https://webrtc.org/getting-started/turn-server), effectively relaying all file data, although encrypted, through a third party server. That is however against the whole purpose of this service, which is to be as secure as possible.

On some Safari browsers, the file download may not work because of bugs on Apple's part.

## Local Development

> **Note**
> This project is tested with Docker Compose V2. Docker Compose V1 will most likely fail to build.

To build and run transfer.zip locally, use docker compose.
```
ENVIRONMENT=dev docker compose up
```
This will start the web server on `localhost:9001`. The signaling server will be proxied through the web-server on the `/ws` endpoint.
