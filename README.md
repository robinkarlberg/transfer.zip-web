# Transfer.zip
Transfer files securely between browsers using peer2peer WebRTC through datachannels.

File data sent using this service is sent directly between browsers using WebRTC. The 
data is also encrypted using AES-GCM with a client-side generated key, and never gets
sent to the server in any way. 

## signaling-server
A simple signaling server implementation using WebSockets, to let peers discover each other.

## web-server
Docker container for hosting the web part of the application.
