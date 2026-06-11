import { describe, expect, it } from "vitest";
import { listenerKeyExchange, connectorKeyExchange, KeyExchangeError } from "@/lib/client/keyexchange";

// Channel pair with session ids, like RelayChannels paired over a code session.
const createChannelPair = (listenerId = "c.712394", connectorId = "abcd1234") => {
  const listener = { sessionId: listenerId, peerId: connectorId, onmessage: undefined, onclosed: undefined };
  const connector = { sessionId: connectorId, peerId: listenerId, onmessage: undefined, onclosed: undefined };
  listener.send = data => queueMicrotask(() => connector.onmessage && connector.onmessage(data));
  connector.send = data => queueMicrotask(() => listener.onmessage && listener.onmessage(data));
  return { listener, connector };
};

const roundTrip = async (encryptKey, decryptKey) => {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, encryptKey, new TextEncoder().encode("hello"));
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, decryptKey, ciphertext);
  return new TextDecoder().decode(plain);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe("code pairing key exchange", () => {
  it("derives interoperable keys and relays the direction", async () => {
    const { listener, connector } = createChannelPair();
    const [listenerKey, result] = await Promise.all([
      listenerKeyExchange(listener, "R"),
      connectorKeyExchange(connector),
    ]);

    expect(result.direction).toBe("R");
    expect(await roundTrip(listenerKey, result.key)).toBe("hello");
    expect(await roundTrip(result.key, listenerKey)).toBe("hello");
  });

  it("relays the send direction too", async () => {
    const { listener, connector } = createChannelPair();
    const [, result] = await Promise.all([
      listenerKeyExchange(listener, "S"),
      connectorKeyExchange(connector),
    ]);
    expect(result.direction).toBe("S");
  });

  it("binds the key to the session ids", async () => {
    // Connector believes it dialed a different code - keys must not match.
    const listener = { sessionId: "c.111111", peerId: "abcd1234", onmessage: undefined, onclosed: undefined };
    const connector = { sessionId: "abcd1234", peerId: "c.222222", onmessage: undefined, onclosed: undefined };
    listener.send = data => queueMicrotask(() => connector.onmessage && connector.onmessage(data));
    connector.send = data => queueMicrotask(() => listener.onmessage && listener.onmessage(data));

    const [listenerKey, result] = await Promise.all([
      listenerKeyExchange(listener, "R"),
      connectorKeyExchange(connector),
    ]);

    await expect(roundTrip(listenerKey, result.key)).rejects.toThrow();
  });

  it("rejects an incompatible handshake version", async () => {
    const { listener, connector } = createChannelPair();
    listener.onmessage = () => listener.send(new Uint8Array([99, 123]));

    await expect(connectorKeyExchange(connector)).rejects.toBeInstanceOf(KeyExchangeError);
  });

  it("rejects garbage handshake payloads", async () => {
    const { listener, connector } = createChannelPair();
    listener.onmessage = () => listener.send(new Uint8Array([1, 0xff, 0xfe]));

    await expect(connectorKeyExchange(connector)).rejects.toBeInstanceOf(KeyExchangeError);
  });

  it("fails when the channel closes mid-handshake", async () => {
    const { connector } = createChannelPair();
    const promise = connectorKeyExchange(connector);
    while (!connector.onclosed) await sleep(1);
    connector.onclosed(new Error("The other device disconnected."));

    await expect(promise).rejects.toThrow("The other device disconnected.");
  });
});
