"use client";

import { useEffect, useRef, useState } from "react";
import { useUnzip } from "./UnzipContext";
import BIcon from "../BIcon";
import { cn } from "@/lib/utils";
import { ARCHIVE_ACCEPT, SUPPORTED_ARCHIVE_LABEL } from "@/lib/client/archive";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UnzipFilePicker({ className }) {
  const {
    unzip,
    unlock,
    isLoading,
    zipFile,
    archiveFormat,
    passwordRequired,
    error,
  } = useUnzip();
  const fileInputRef = useRef();
  const [password, setPassword] = useState("");

  const handleFileInputChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    await unzip(files[0]);
    e.target.value = "";
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (await unlock(password)) setPassword("");
  };

  useEffect(() => {
    setPassword("");
  }, [zipFile]);

  return (
    <>
      <form style={{ display: "none" }}>
        <input
          ref={fileInputRef}
          onChange={handleFileInputChange}
          type="file"
          aria-hidden="true"
          accept={ARCHIVE_ACCEPT}
        />
      </form>
      <div className={cn("w-full", className)}>
        <div className="relative w-full flex flex-col min-h-56 rounded-2xl bg-white border shadow-lg">
        {isLoading ? (
          <div className="absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center">
            <div className="animate-spin text-primary">
              <BIcon name={"arrow-repeat"} className={"text-4xl"} />
            </div>
            <span className="font-medium mt-4 text-lg">
              {passwordRequired ? "Checking password..." : "Opening archive..."}
            </span>
          </div>
        ) : passwordRequired ? (
          <form
            onSubmit={handlePasswordSubmit}
            className="absolute left-0 top-0 w-full h-full flex flex-col justify-center px-8"
          >
            <div className="text-primary text-center">
              <BIcon name={"lock-fill"} className={"text-3xl"} />
            </div>
            <div className="mt-3">
              <Label htmlFor="archive-password">Enter the password for {zipFile.name}</Label>
            </div>
            <div className="mt-2">
              <Input
                id="archive-password"
                name="archive-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
                aria-describedby="archive-password-privacy"
                autoFocus
              />
            </div>
            <div className="mt-3 flex justify-end">
              <Button type="submit" disabled={!password}>Open archive</Button>
            </div>
            <p id="archive-password-privacy" className="mt-2 text-xs text-gray-500">
              The password is used only in this tab. It is never sent from your device.
            </p>
          </form>
        ) : zipFile ? (
          <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }}
            className="absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center cursor-pointer"
          >
            <div className="text-green-500">
              <BIcon name={"check-circle-fill"} className={"text-4xl"} />
            </div>
            <span className="font-medium mt-4 text-lg">{zipFile.name}</span>
            <span className="text-gray-500 text-sm mt-1">{archiveFormat} archive opened</span>
            <span className="text-gray-500 text-sm mt-1">Click to choose another file</span>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }}
            className="absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center cursor-pointer"
          >
            <div className="text-white rounded-full bg-primary w-12 h-12 flex">
              <BIcon name={"plus"} center className={"flex-grow text-3xl"} />
            </div>
            <span className="font-medium mt-4 text-lg">Pick a ZIP or TAR archive</span>
          </div>
        )}
        </div>
        <p className="mt-3 text-center text-sm font-medium text-white">
          Supported formats: {SUPPORTED_ARCHIVE_LABEL}
        </p>
        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-white p-3 text-sm font-medium text-red-700 shadow">
            {error}
          </p>
        )}
      </div>
    </>
  );
}
