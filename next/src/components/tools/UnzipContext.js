"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { openArchive, validateArchivePassword } from "@/lib/client/archive";

const UnzipContext = createContext(null);

export function UnzipProvider({ children }) {
  const [zipFile, setZipFile] = useState(null);
  const [richFiles, setRichFiles] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState(null);
  const [archiveFormat, setArchiveFormat] = useState(null);
  const archiveRef = useRef(null);

  const unzip = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    setZipFile(null);
    setRichFiles(null);
    setPasswordRequired(false);
    setPassword(null);
    setArchiveFormat(null);

    try {
      if (archiveRef.current) {
        await archiveRef.current.close();
      }

      const archive = await openArchive(file);
      archiveRef.current = archive;
      setZipFile(file);
      setArchiveFormat(archive.format);
      setPasswordRequired(archive.requiresPassword);
      if (!archive.requiresPassword) setRichFiles(archive.files);
    } catch (err) {
      archiveRef.current = null;
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unlock = useCallback(async (candidate) => {
    setIsLoading(true);
    setError(null);

    try {
      await validateArchivePassword(archiveRef.current, candidate);
      setPassword(candidate);
      setPasswordRequired(false);
      setRichFiles(archiveRef.current.files);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(async () => {
    if (archiveRef.current) await archiveRef.current.close();
    archiveRef.current = null;
    setZipFile(null);
    setRichFiles(null);
    setError(null);
    setPasswordRequired(false);
    setPassword(null);
    setArchiveFormat(null);
  }, []);

  useEffect(() => {
    return () => {
      if (archiveRef.current) archiveRef.current.close();
    };
  }, []);

  return (
    <UnzipContext.Provider value={{
      zipFile,
      richFiles,
      isLoading,
      error,
      passwordRequired,
      password,
      archiveFormat,
      unzip,
      unlock,
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
