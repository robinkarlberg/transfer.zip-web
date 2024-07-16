export default class StorageFullError extends Error {
    constructor() {
        super("Storage full.")
        this.name = "StorageFullError"
    }
}