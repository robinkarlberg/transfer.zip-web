"use client";

import { createContext, useContext, useState, useCallback } from "react";
import * as zip from "@zip.js/zip.js";

const UnzipContext = createContext(null);

export function UnzipProvider({ children }) {
  const [zipFile, setZipFile] = useState(null);
  const [richFiles, setRichFiles] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const unzip = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      const _files = [];
      const zipFileReader = new zip.BlobReader(file);
      const zipReader = new zip.ZipReader(zipFileReader);
      const entries = await zipReader.getEntries();

      for (const entry of entries) {
        const split = entry.filename.split("/");
        if (!entry.directory) {
          _files.push({
            info: {
              name: split[split.length - 1],
              size: entry.uncompressedSize,
              relativePath: entry.filename,
              type: getMimeType(split[split.length - 1])
            },
            entry
          });
        }
      }

      setZipFile(file);
      setRichFiles(_files);
    } catch (err) {
      setError(err.message || "Failed to unzip file");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setZipFile(null);
    setRichFiles(null);
    setError(null);
  }, []);

  return (
    <UnzipContext.Provider value={{
      zipFile,
      richFiles,
      isLoading,
      error,
      unzip,
      reset
    }}>
      {children}
    </UnzipContext.Provider>
  );
}

export function useUnzip() {
  const context = useContext(UnzipContext);
  if (!context) {
    throw new Error("useUnzip must be used within an UnzipProvider");
  }
  return context;
}

function getMimeType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    // Images
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'ico': 'image/x-icon',
    'bmp': 'image/bmp',
    // Text
    'txt': 'text/plain',
    'md': 'text/markdown',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'csv': 'text/csv',
    // Code
    'js': 'text/javascript',
    'jsx': 'text/javascript',
    'ts': 'text/typescript',
    'tsx': 'text/typescript',
    'json': 'application/json',
    'xml': 'application/xml',
    'py': 'text/x-python',
    'rb': 'text/x-ruby',
    'java': 'text/x-java',
    'c': 'text/x-c',
    'cpp': 'text/x-c++',
    'h': 'text/x-c',
    'hpp': 'text/x-c++',
    'go': 'text/x-go',
    'rs': 'text/x-rust',
    'php': 'text/x-php',
    'sh': 'text/x-shellscript',
    'bash': 'text/x-shellscript',
    'zsh': 'text/x-shellscript',
    'yaml': 'text/yaml',
    'yml': 'text/yaml',
    'toml': 'text/toml',
    'ini': 'text/plain',
    'conf': 'text/plain',
    'env': 'text/plain',
    // Documents
    'pdf': 'application/pdf',
    // Audio
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    // Video
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'mov': 'video/quicktime',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
