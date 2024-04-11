export default class PeerConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = "PeerConnectionError";
    }
}