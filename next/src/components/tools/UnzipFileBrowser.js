"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useUnzip } from "./UnzipContext";
import BIcon from "../BIcon";
import { humanFileSize } from "@/lib/transferUtils";
import { buildNestedStructure } from "@/lib/utils";
import streamSaver from "@/lib/client/StreamSaver";
import EmptySpace from "../elements/EmptySpace";
import FilePreview from "./FilePreview";

const MAX_PREVIEW_SIZE = 5 * 1024 * 1024; // 5MB max for preview

const FileBrowserEntry = ({ richFile, isOpen, onClick, onPreview, isSelected }) => {
  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        className={`text-sm w-full text-start px-3.5 py-2 relative hover:bg-gray-100 flex items-center gap-2 cursor-pointer ${isSelected ? "bg-primary-50 hover:bg-primary-100" : ""}`}
        onClick={onClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      >
        {richFile.isDirectory && (
          <div className={`transform transition-transform ${isOpen ? "" : "-rotate-90"}`}>
            <BIcon name={"chevron-down"} className={"text-gray-700"} />
          </div>
        )}
        <BIcon
          name={richFile.isDirectory ? "folder-fill" : getFileIcon(richFile.info.name)}
          className={`${richFile.isDirectory ? "text-yellow-500" : "text-gray-500"}`}
        />
        <span className={`flex-grow truncate ${richFile.isDirectory ? "font-medium" : "font-normal"}`}>
          {richFile.isDirectory ? richFile.info.name.slice(0, -1) : richFile.info.name}
        </span>
        <span className="text-xs text-gray-400 shrink-0">
          {richFile.isDirectory ? (
            <span>{richFile.info.size} items</span>
          ) : (
            <span>{humanFileSize(richFile.info.size)}</span>
          )}
        </span>
        {!richFile.isDirectory && canPreview(richFile) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(richFile);
            }}
            className="p-1 hover:bg-gray-200 rounded shrink-0"
            title="Preview"
          >
            <BIcon name={"eye"} className={"text-gray-500"} />
          </button>
        )}
      </div>
      {richFile.isDirectory && isOpen && (
        <div className="ml-4 border-l border-gray-200">
          {richFile.children}
        </div>
      )}
    </div>
  );
};

function getFileIcon(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const iconMap = {
    // Images
    'png': 'file-earmark-image',
    'jpg': 'file-earmark-image',
    'jpeg': 'file-earmark-image',
    'gif': 'file-earmark-image',
    'webp': 'file-earmark-image',
    'svg': 'file-earmark-image',
    // Code
    'js': 'file-earmark-code',
    'jsx': 'file-earmark-code',
    'ts': 'file-earmark-code',
    'tsx': 'file-earmark-code',
    'py': 'file-earmark-code',
    'html': 'file-earmark-code',
    'css': 'file-earmark-code',
    'json': 'file-earmark-code',
    // Text
    'txt': 'file-earmark-text',
    'md': 'file-earmark-text',
    // Archive
    'zip': 'file-earmark-zip',
    'rar': 'file-earmark-zip',
    '7z': 'file-earmark-zip',
    // PDF
    'pdf': 'file-earmark-pdf',
    // Music
    'mp3': 'file-earmark-music',
    'wav': 'file-earmark-music',
    'ogg': 'file-earmark-music',
    // Video
    'mp4': 'file-earmark-play',
    'webm': 'file-earmark-play',
    'mov': 'file-earmark-play',
  };
  return iconMap[ext] || 'file-earmark';
}

function canPreview(richFile) {
  if (richFile.info.size > MAX_PREVIEW_SIZE) return false;

  const type = richFile.info.type;
  return (
    type.startsWith('image/') ||
    type.startsWith('text/') ||
    type === 'application/json' ||
    type === 'application/xml'
  );
}

const mapEntriesFromPath = (nestedStructure, openedPaths, toggleDirectoryOpen, onRichFileClick, onPreview, selectedFile) => {
  const mapDirectory = (directory, path = "") => {
    const fullPath = path + directory.name;
    const isOpen = openedPaths.includes(fullPath);

    const richFile = {
      info: { name: directory.name, size: directory.files?.length + directory.directories?.length },
      isDirectory: true
    };

    const children = [
      ...directory.directories.map(dir => mapDirectory(dir, fullPath)),
      ...directory.files.map(file => (
        <FileBrowserEntry
          key={fullPath + file.info.name}
          richFile={file}
          isOpen={false}
          onClick={() => onRichFileClick(file)}
          onPreview={onPreview}
          isSelected={selectedFile?.info?.relativePath === file.info.relativePath}
        />
      ))
    ];

    richFile.children = children;

    return (
      <FileBrowserEntry
        key={fullPath}
        richFile={richFile}
        isOpen={isOpen}
        onClick={() => toggleDirectoryOpen(fullPath)}
        onPreview={onPreview}
        isSelected={false}
      />
    );
  };

  return [
    ...nestedStructure.directories.map(directory => mapDirectory(directory, "")),
    ...nestedStructure.files.map(file => (
      <FileBrowserEntry
        key={file.info.name}
        richFile={file}
        isOpen={false}
        onClick={() => onRichFileClick(file)}
        onPreview={onPreview}
        isSelected={selectedFile?.info?.relativePath === file.info.relativePath}
      />
    )),
  ];
};

export default function UnzipFileBrowser() {
  const { zipFile, richFiles } = useUnzip();
  const [openedPaths, setOpenedPaths] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const browserRef = useRef(null);

  const nestedStructure = useMemo(() =>
    richFiles ? buildNestedStructure(richFiles) : { directories: [], files: [] },
    [richFiles]
  );

  // Scroll to browser when files are loaded
  useEffect(() => {
    if (richFiles && browserRef.current) {
      browserRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [richFiles]);

  const toggleDirectoryOpen = useCallback((path) => {
    setOpenedPaths(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  }, []);

  const handleDownload = useCallback(async (richFile) => {
    const fileStream = streamSaver.createWriteStream(richFile.info.name);
    await richFile.entry.getData(fileStream);
  }, []);

  const handlePreview = useCallback(async (richFile) => {
    setSelectedFile(richFile);
    setIsLoadingPreview(true);
    setPreviewData(null);

    try {
      // Use zip.js BlobWriter to get the file data
      const { BlobWriter } = await import("@zip.js/zip.js");
      const blobWriter = new BlobWriter(richFile.info.type);
      const data = await richFile.entry.getData(blobWriter);

      if (richFile.info.type.startsWith('image/')) {
        const url = URL.createObjectURL(data);
        setPreviewData({ type: 'image', url });
      } else if (
        richFile.info.type.startsWith('text/') ||
        richFile.info.type === 'application/json' ||
        richFile.info.type === 'application/xml'
      ) {
        const text = await data.text();
        setPreviewData({ type: 'text', content: text, mimeType: richFile.info.type });
      }
    } catch (err) {
      console.error('Preview error:', err);
      setPreviewData({ type: 'error', message: 'Failed to load preview' });
    } finally {
      setIsLoadingPreview(false);
    }
  }, []);

  const closePreview = useCallback(() => {
    if (previewData?.url) {
      URL.revokeObjectURL(previewData.url);
    }
    setSelectedFile(null);
    setPreviewData(null);
  }, [previewData]);

  if (!richFiles) {
    return (
      <div ref={browserRef}>
        <EmptySpace
          title="Select a ZIP file to get started"
          subtitle="Browse and preview files from your archive. Click on any file to download it, or use the preview button to view images and text files."
        />
      </div>
    );
  }

  return (
    <div ref={browserRef} className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BIcon name={"file-earmark-zip"} className={"text-primary"} />
          <span className="font-medium truncate">{zipFile?.name}</span>
        </div>
        <span className="text-sm text-gray-500">{richFiles.length} files</span>
      </div>

      <div className="flex">
        <div className={`${selectedFile ? 'w-1/2 border-r' : 'w-full'} max-h-96 overflow-auto`}>
          {mapEntriesFromPath(nestedStructure, openedPaths, toggleDirectoryOpen, handleDownload, handlePreview, selectedFile)}
        </div>

        {selectedFile && (
          <div className="w-1/2 flex flex-col">
            <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
              <span className="text-sm font-medium truncate">{selectedFile.info.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Download"
                >
                  <BIcon name={"download"} className={"text-gray-600"} />
                </button>
                <button
                  onClick={closePreview}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Close preview"
                >
                  <BIcon name={"x"} className={"text-gray-600"} />
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-auto p-4">
              <FilePreview
                data={previewData}
                isLoading={isLoadingPreview}
                fileName={selectedFile.info.name}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
