# Todo

- [x] Improve encryption by sending unique IVs with every file chunk
- [x] Implement service worker, to proxy download stream and enable infinite file sizes
  - [x] For desktop
  - [x] For mobile
- [ ] Resumeable downloads if something goes wrong
- [x] Error messages in the UI when something goes wrong
- [ ] Challenge-response to verify receiving peer has the right key
- [x] Sync progress bars
- [ ] Smaller user ids, to shorten the link
- [x] Dockerize signaling-server
- [ ] Self-hosted stun-server
- [x] docker-compose
- [ ] Add file transfer options:
  - [ ] Multiple peers / single peer
    - [ ] Enable file transfer to multiple peers
  - [ ] Compress data
