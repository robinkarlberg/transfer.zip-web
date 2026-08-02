import { describe, expect, it } from "vitest";
import * as zip from "@zip.js/zip.js";
import {
  openArchive,
  readArchiveEntry,
  validateArchivePassword,
} from "@/lib/client/archive";

zip.configure({ useWebWorkers: false });

describe("browser archive reader", () => {
  it("opens an uncompressed TAR archive and reads nested files", async () => {
    const archiveBlob = createTar([
      { name: "notes/readme.txt", content: "hello from tar" },
      { name: "photo.jpg", content: "image bytes" },
    ]);
    const file = new File([archiveBlob], "sample.tar", { type: "application/x-tar" });

    const archive = await openArchive(file);

    expect(archive.format).toBe("TAR");
    expect(archive.requiresPassword).toBe(false);
    expect(archive.files.map((entry) => entry.info.relativePath)).toEqual([
      "notes/readme.txt",
      "photo.jpg",
    ]);
    expect(archive.files[0].info.type).toBe("text/plain");
    expect(await (await readArchiveEntry(archive.files[0])).text()).toBe("hello from tar");
  });

  it("opens and validates an AES-encrypted ZIP archive", async () => {
    const writer = new zip.ZipWriter(new zip.BlobWriter("application/zip"));
    await writer.add("secret.txt", new zip.TextReader("private content"), {
      password: "correct horse",
      encryptionStrength: 3,
    });
    const blob = await writer.close();
    const file = new File([blob], "protected.zip", { type: "application/zip" });

    const archive = await openArchive(file);

    expect(archive.format).toBe("ZIP");
    expect(archive.requiresPassword).toBe(true);
    await expect(validateArchivePassword(archive, "wrong password")).rejects.toThrow(
      "That password did not open this ZIP file."
    );
    await expect(validateArchivePassword(archive, "correct horse")).resolves.toBeUndefined();
    expect(await (await readArchiveEntry(archive.files[0], "correct horse")).text()).toBe(
      "private content"
    );

    await archive.close();
  });

  it("returns clear errors for unsupported RAR and 7-Zip archives", async () => {
    const rar = new File(
      [new Uint8Array([0x52, 0x61, 0x72, 0x21, 0x1a, 0x07])],
      "sample.rar"
    );
    const sevenZip = new File(
      [new Uint8Array([0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c])],
      "sample.7z"
    );

    await expect(openArchive(rar)).rejects.toThrow("RAR archives are not supported yet.");
    await expect(openArchive(sevenZip)).rejects.toThrow("7-Zip archives are not supported yet.");
  });
});

function createTar(entries) {
  const parts = [];

  for (const entry of entries) {
    const content = new TextEncoder().encode(entry.content);
    const header = new Uint8Array(512);
    writeTarString(header, 0, 100, entry.name);
    writeTarOctal(header, 100, 8, 0o644);
    writeTarOctal(header, 108, 8, 0);
    writeTarOctal(header, 116, 8, 0);
    writeTarOctal(header, 124, 12, content.length);
    writeTarOctal(header, 136, 12, 0);
    header.fill(0x20, 148, 156);
    header[156] = "0".charCodeAt(0);
    writeTarString(header, 257, 6, "ustar");
    writeTarString(header, 263, 2, "00");

    const checksum = header.reduce((sum, byte) => sum + byte, 0);
    writeTarOctal(header, 148, 8, checksum);

    parts.push(header, content);
    const padding = (512 - (content.length % 512)) % 512;
    if (padding) parts.push(new Uint8Array(padding));
  }

  parts.push(new Uint8Array(1024));
  return new Blob(parts, { type: "application/x-tar" });
}

function writeTarString(target, offset, length, value) {
  target.set(new TextEncoder().encode(value).subarray(0, length), offset);
}

function writeTarOctal(target, offset, length, value) {
  const encoded = value.toString(8).padStart(length - 2, "0");
  writeTarString(target, offset, length, `${encoded}\0 `);
}
