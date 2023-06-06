# Transfer.zip
Transfer files encrypted between browsers using peer2peer WebRTC through datachannels.

Data sent with this service is encrypted using AES-GCM and the key never touches the server.
Even if the server got hold of the key, the file data never touches the server. The communication
always happens directly between the browsers.

## signaling-server
A simple signaling server implementation using WebSockets.

## web-server
Docker container hosting the web part of the application.
