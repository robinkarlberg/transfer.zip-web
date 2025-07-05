import { useCallback, useMemo, useState } from "react";
import BIcon from "../BIcon";
import { humanFileSize } from "@/lib/transferUtils";
import { buildNestedStructure } from "@/lib/utils";

const FileBrowserEntry = ({ richFile, isOpen, onClick }) => {
  return (
    <div>
      <button className="text-sm w-full text-start px-3.5 py-1.5 relative hover:bg-gray-100" onClick={onClick}>
        {richFile.isDirectory && (
          <div className={`me-0.5 inline-block transform transition-transform ${isOpen ? "" : "-rotate-90"}`}>
            <BIcon name={"chevron-down"} className={"text-gray-700"} />
          </div>
        )}
        <BIcon name={richFile.isDirectory ? "folder-fill" : "file-earmark"} className={"ms-1.5 me-1 text-gray-700"} />
        <span className={`${richFile.isDirectory ? "font-medium" : "font-normal"}`}>
          {richFile.isDirectory ? richFile.info.name.slice(0, -1) : richFile.info.name}
        </span>
        <span className="ms-2 text-xs text-gray-500">
          {richFile.isDirectory ?
            <span>{richFile.info.size} items</span>
            :
            <span>{humanFileSize(richFile.info.size)}</span>
          }
        </span>
      </button>
      {richFile.isDirectory && isOpen && (
        <div className="ml-4">
          {richFile.children}
        </div>
      )}
    </div>
  );
};

const mapEntriesFromPath = (nestedStructure, openedPaths, toggleDirectoryOpen, onRichFileClick) => {
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
      />
    )),
  ];
};

export default function FileBrowser({ richFiles, onAction }) {
  const [openedPaths, setOpenedPaths] = useState([]);

  const nestedStructure = useMemo(() => buildNestedStructure(richFiles), [richFiles]);
  console.log(nestedStructure)

  const toggleDirectoryOpen = useCallback((path) => {
    setOpenedPaths(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  }, []);

  const handleRichFileClick = useCallback(richFile => {
    if (!richFile.isDirectory) {
      onAction("click", richFile);
    }
  }, [onAction]);

  return (
    <div className="flex flex-col border shadow-sm py-2">
      {mapEntriesFromPath(nestedStructure, openedPaths, toggleDirectoryOpen, handleRichFileClick)}
    </div >
  );
}