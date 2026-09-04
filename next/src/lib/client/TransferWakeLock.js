export class TransferWakeLock {
	#active = false;
	#pending = false;
	#lock = null;
	#onVisibilityChange = () => this.#request();

	start() {
		if (this.#active) return;
		this.#active = true;
		document.addEventListener("visibilitychange", this.#onVisibilityChange);
		this.#request();
	}

	stop() {
		this.#active = false;
		document.removeEventListener("visibilitychange", this.#onVisibilityChange);
		if (this.#lock) {
			this.#lock.release().catch(() => {});
			this.#lock = null;
		}
	}

	async #request() {
		if (!this.#active || this.#pending || this.#lock || document.hidden || !("wakeLock" in navigator)) return;
		this.#pending = true;
		try {
			const lock = await navigator.wakeLock.request("screen");
			if (!this.#active || document.hidden) {
				await lock.release();
				return;
			}
			this.#lock = lock;
			lock.addEventListener("release", () => {
				if (this.#lock === lock) this.#lock = null;
			});
		} catch {
			// Browsers can deny wake locks in power-saving mode; the transfer still works.
		} finally {
			this.#pending = false;
		}
	}
}
