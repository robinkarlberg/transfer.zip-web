import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TransferWakeLock } from "@/lib/client/TransferWakeLock";

let document;
let request;
const makeLock = () => {
  const lock = new EventTarget();
  lock.release = vi.fn(async () => lock.dispatchEvent(new Event("release")));
  return lock;
};

beforeEach(() => {
  document = new EventTarget();
  document.hidden = false;
  request = vi.fn(async () => makeLock());
  vi.stubGlobal("document", document);
  vi.stubGlobal("navigator", { wakeLock: { request } });
});

afterEach(() => vi.unstubAllGlobals());

describe("transfer screen wake lock", () => {
  it("holds one lock during a transfer and releases it on completion", async () => {
    const lock = makeLock();
    request.mockResolvedValue(lock);
    const transfer = new TransferWakeLock();
    transfer.start();
    transfer.start();
    await Promise.resolve();
    expect(request).toHaveBeenCalledExactlyOnceWith("screen");
    transfer.stop();
    expect(lock.release).toHaveBeenCalledOnce();
  });

  it("reacquires the lock when the user returns to the page", async () => {
    const lock = makeLock();
    request.mockResolvedValueOnce(lock);
    const transfer = new TransferWakeLock();
    transfer.start();
    await Promise.resolve();
    document.hidden = true;
    await lock.release();
    document.dispatchEvent(new Event("visibilitychange"));
    expect(request).toHaveBeenCalledTimes(1);
    document.hidden = false;
    document.dispatchEvent(new Event("visibilitychange"));
    await Promise.resolve();
    expect(request).toHaveBeenCalledTimes(2);
    transfer.stop();
  });

  it("releases a delayed lock if the transfer was canceled", async () => {
    let resolve;
    const lock = makeLock();
    request.mockReturnValue(new Promise(done => { resolve = done; }));
    const transfer = new TransferWakeLock();
    transfer.start();
    transfer.stop();
    resolve(lock);
    await Promise.resolve();
    expect(lock.release).toHaveBeenCalledOnce();
  });

  it("allows transfers when wake locks are unsupported or denied", async () => {
    vi.stubGlobal("navigator", {});
    const unsupported = new TransferWakeLock();
    unsupported.start();
    expect(request).not.toHaveBeenCalled();
    unsupported.stop();
    vi.stubGlobal("navigator", { wakeLock: { request } });
    request.mockRejectedValue(new Error("Power saving mode"));
    const denied = new TransferWakeLock();
    denied.start();
    await Promise.resolve();
    denied.stop();
  });
});
