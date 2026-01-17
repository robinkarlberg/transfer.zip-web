"use client";

import { useRef } from "react";
import { useUnzip } from "./UnzipContext";
import BIcon from "../BIcon";
import { cn } from "@/lib/utils";

export default function UnzipFilePicker({ className }) {
  const { unzip, isLoading, zipFile } = useUnzip();
  const fileInputRef = useRef();

  const handleFileInputChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    await unzip(files[0]);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <form style={{ display: "none" }}>
        <input
          ref={fileInputRef}
          onChange={handleFileInputChange}
          type="file"
          aria-hidden="true"
          accept=".zip"
        />
      </form>
      <div
        onClick={handleClick}
        className={cn(
          "relative w-full flex flex-col min-h-56 rounded-2xl bg-white border shadow-lg cursor-pointer",
          className
        )}
      >
        {isLoading ? (
          <div className="absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center">
            <div className="animate-spin text-primary">
              <BIcon name={"arrow-repeat"} className={"text-4xl"} />
            </div>
            <span className="font-medium mt-4 text-lg">Unzipping...</span>
          </div>
        ) : zipFile ? (
          <div className="absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center">
            <div className="text-green-500">
              <BIcon name={"check-circle-fill"} className={"text-4xl"} />
            </div>
            <span className="font-medium mt-4 text-lg">{zipFile.name}</span>
            <span className="text-gray-500 text-sm mt-1">Click to choose another file</span>
          </div>
        ) : (
          <div className="absolute left-0 top-0 w-full h-full flex flex-col justify-center items-center">
            <div className="text-white rounded-full bg-primary w-12 h-12 flex">
              <BIcon name={"plus"} center className={"flex-grow text-3xl"} />
            </div>
            <span className="font-medium mt-4 text-lg">Pick a ZIP file</span>
          </div>
        )}
      </div>
    </>
  );
}
