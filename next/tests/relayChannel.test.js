import { describe, expect, it, vi } from "vitest";
import { RelayChannel, PeerDisconnectedError, RelayConnectionError } from "@/lib/client/relay";

const createChannel = () => {
  const client = { bufferedAmount: 0, _sendRelay: vi.fn(), _removeChannel: vi.fn() };
  return { client, channel: new RelayChannel(client, "abcd1234", "c.123456") };
};

describe("relay channel", () => {
  it("keeps messages received while mobile key derivation is pending", () => {
    const { channel } = createChannel();
    const packets = [new Uint8Array([1]), new Uint8Array([2])];
    for (const packet of packets) channel._receive(packet);
    const received = [];
    channel.onmessage = data => received.push(data);
    expect(received).toEqual(packets);
  });

  it("preserves packets between the handshake and file receiver handlers", () => {
    const { channel } = createChannel();
    channel._receive(new Uint8Array([1]));
    channel._receive(new Uint8Array([2]));
    const handshake = vi.fn(() => { channel.onmessage = undefined; });
    channel.onmessage = handshake;
    const receiver = vi.fn();
    channel.onmessage = receiver;
    expect(handshake).toHaveBeenCalledExactlyOnceWith(new Uint8Array([1]));
    expect(receiver).toHaveBeenCalledExactlyOnceWith(new Uint8Array([2]));
  });

  it("bounds memory while no packet handler is ready", () => {
    const { channel } = createChannel();
    const onclosed = vi.fn();
    channel.onclosed = onclosed;
    channel._receive(new Uint8Array(1024 * 1024 + 1));
    expect(channel.closed).toBe(true);
    expect(onclosed).toHaveBeenCalledWith(expect.any(RelayConnectionError));
  });

  it("waits for socket capacity and stops waiting if the channel closes", async () => {
    const { client, channel } = createChannel();
    client.bufferedAmount = 2 * 1024 * 1024;
    const drained = vi.fn();
    const wait = channel.waitForDrain(() => true).then(drained);
    await new Promise(resolve => setTimeout(resolve, 25));
    expect(drained).not.toHaveBeenCalled();
    client.bufferedAmount = 0;
    await wait;
    expect(drained).toHaveBeenCalledOnce();
    client.bufferedAmount = 2 * 1024 * 1024;
    const interrupted = channel.waitForDrain(() => true);
    channel.close();
    await expect(interrupted).rejects.toBeInstanceOf(PeerDisconnectedError);
  });

  it("stops waiting for socket capacity when the transfer is canceled", async () => {
    const { client, channel } = createChannel();
    client.bufferedAmount = 2 * 1024 * 1024;
    let active = true;
    const wait = channel.waitForDrain(() => active);
    active = false;
    await wait;
  });
});
