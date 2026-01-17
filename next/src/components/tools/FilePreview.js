"use client";

import BIcon from "../BIcon";

const languageMap = {
  'text/javascript': 'javascript',
  'text/typescript': 'typescript',
  'application/json': 'json',
  'text/html': 'html',
  'text/css': 'css',
  'text/x-python': 'python',
  'text/x-java': 'java',
  'text/x-c': 'c',
  'text/x-c++': 'cpp',
  'text/x-go': 'go',
  'text/x-rust': 'rust',
  'text/x-ruby': 'ruby',
  'text/x-php': 'php',
  'text/x-shellscript': 'bash',
  'text/yaml': 'yaml',
  'text/markdown': 'markdown',
  'application/xml': 'xml',
};

export default function FilePreview({ data, isLoading, fileName }) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin text-primary">
          <BIcon name={"arrow-repeat"} className={"text-2xl"} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>No preview available</p>
      </div>
    );
  }

  if (data.type === 'error') {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        <BIcon name={"exclamation-triangle"} className={"me-2"} />
        {data.message}
      </div>
    );
  }

  if (data.type === 'image') {
    return (
      <div className="h-full flex items-center justify-center bg-[url('/checkerboard.svg')] bg-repeat">
        <img
          src={data.url}
          alt={fileName}
          className="max-w-full max-h-80 object-contain"
        />
      </div>
    );
  }

  if (data.type === 'text') {
    const language = languageMap[data.mimeType] || 'plaintext';
    const lines = data.content.split('\n');
    const maxLines = 500;
    const truncated = lines.length > maxLines;
    const displayLines = truncated ? lines.slice(0, maxLines) : lines;

    return (
      <div className="h-full overflow-auto">
        <pre className="text-xs font-mono bg-gray-50 rounded p-3 overflow-x-auto">
          <code>
            {displayLines.map((line, i) => (
              <div key={i} className="flex">
                <span className="text-gray-400 select-none w-8 shrink-0 text-right pr-3">
                  {i + 1}
                </span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
          </code>
        </pre>
        {truncated && (
          <p className="text-center text-sm text-gray-500 mt-2">
            Showing first {maxLines} of {lines.length} lines
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      <p>Unsupported file type</p>
    </div>
  );
}
