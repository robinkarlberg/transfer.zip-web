# Transfer.zip
Transfer files securely between browsers using WebRTC peer2peer.

Data sent using this service is transfered directly between browsers using WebRTC. The 
data is also encrypted using AES-GCM with a client-side 256 bit generated key. The file
data and the key never touches the server.

## signaling-server
A simple signaling server implementation using WebSockets, to let peers initially discover each other.

## web-server
Docker container for hosting the web part of the application.

## stun-server (todo)
