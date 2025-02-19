import { useCallback, useMemo, useState } from "react"
import { buildNestedStructure, createRichFileObject } from "../../utils";

const FileBrowserEntry = ({ richFile, onClick }) => {
  return (
    <button onClick={onClick}>
      {richFile.info.name}
    </button>
  )
}

const mapEntriesFromPath = (nestedStructure, path, onRichFileClick) => {
  const findDirectory = (current, pathParts) => {
    if (pathParts.length === 0) {
      return current
    }
    const [nextDir, ...remainingParts] = pathParts
    const foundDir = current.directories.find(dir => dir.name === nextDir + "/")

    if (foundDir) {
      return findDirectory(foundDir, remainingParts)
    }
    return null
  };
  const pathParts = path.split('/').filter(part => part)
  const targetDirectory = findDirectory(nestedStructure, pathParts)

  const returns = []
  if (path != "" && path != "/") {
    returns.push((
      <button>
        up
      </button>
    ))
  }
  if (targetDirectory) {
    returns.push(...targetDirectory.directories.map(dir => {
      const richFile = { info: { name: dir.name, size: dir.files?.length + dir.directories?.length }, isDirectory: true }
      return <FileBrowserEntry onClick={() => onRichFileClick(richFile)} key={dir.name} richFile={richFile} />
    }))
    returns.push(...targetDirectory.files.map(file => {
      const richFile = file
      return <FileBrowserEntry onClick={() => onRichFileClick(richFile)} key={file.info.name} richFile={file} />
    }))
  }
  return returns
}

export default function FileBrowser({ richFiles, onAction }) {
  const [currentPath, setCurrentPath] = useState("/")

  const nestedStructure = useMemo(() => buildNestedStructure(richFiles), [richFiles])

  const handleRichFileClick = useCallback(richFile => {
    if (richFile.isDirectory) {
      setCurrentPath(currentPath + richFile.info.name)
    }
    else onAction("click", richFile)
  })

  return (
    <div className="flex flex-col">
      {mapEntriesFromPath(nestedStructure, currentPath, handleRichFileClick)}
    </div>
  )
}