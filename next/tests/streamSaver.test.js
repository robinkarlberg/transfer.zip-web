import { readFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it, vi } from "vitest";

const saverSource = readFileSync(new URL("../src/lib/client/StreamSaver.js", import.meta.url), "utf8");
const workerSource = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");

const createDownload = (userAgent = "Chrome") => {
  const frames = [];
  const messages = [];
  const downloads = [];
  const window = {
    HTMLElement: function HTMLElement() {},
    isSecureContext: true,
    WritableStream,
  };
  const document = {
    documentElement: { style: {} },
    body: { appendChild: frame => frames.push(frame) },
    createElement: () => ({
      contentWindow: { postMessage: (...args) => messages.push(args) },
      addEventListener: (_, fn) => queueMicrotask(fn),
      click() { downloads.push(this.href); },
    }),
  };
  const module = { exports: {} };
  vm.runInNewContext(saverSource, {
    module, window, document,
    navigator: { userAgent, serviceWorker: {} },
    console: { log: vi.fn(), warn: vi.fn() },
    Response, ReadableStream, TransformStream, MessageChannel,
    Uint8Array, Blob, URL,
  });
  const stream = module.exports.createWriteStream("photo.bin", { size: 3 * 1024 * 1024 });
  return { stream, frames, messages, downloads };
};

describe("StreamSaver download startup", () => {
  it("hands the stream and download metadata to the worker atomically", async () => {
    const { stream, messages } = createDownload();
    await vi.waitFor(() => expect(messages).toHaveLength(1));
    const [data, , transfers] = messages[0];

    // The worker can receive a fetch before a second MessagePort event arrives.
    // A single transfer must already contain the stream when it publishes the URL.
    const replies = [];
    const self = { addEventListener: vi.fn(), registration: { scope: "https://transfer.test/" } };
    vm.runInNewContext(workerSource, { self, Headers, Response, ReadableStream, console });
    self.onmessage({ data, ports: [{ postMessage: msg => replies.push(msg) }] });
    let response;
    await self.onfetch({
      request: { url: replies[0].download },
      respondWith: value => { response = value; },
    });
    expect(response.body).not.toBeNull();
    expect(transfers).toContain(data.readableStream);

    const bytes = new Uint8Array(3 * 1024 * 1024).fill(42);
    const saved = response.arrayBuffer();
    const writer = stream.getWriter();
    await writer.write(bytes);
    await writer.close();
    expect(Buffer.compare(Buffer.from(await saved), Buffer.from(bytes))).toBe(0);
    for (const transfer of transfers) if (transfer instanceof MessagePort) transfer.close();
  });

  it("preserves the Safari Blob download fallback", async () => {
    const { stream, messages, downloads } = createDownload("Version/26.0 Mobile Safari/604.1");
    const writer = stream.getWriter();
    await writer.write(new Uint8Array([1, 2, 3]));
    await writer.write(new Uint8Array([4, 5, 6]));
    await writer.close();
    expect(messages).toHaveLength(0);
    expect(downloads).toHaveLength(1);
    const response = await fetch(downloads[0]);
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));
    URL.revokeObjectURL(downloads[0]);
  });
});
