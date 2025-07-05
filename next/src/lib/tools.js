export const tools = [
  { slug: 'zip-files-online', title: 'Zip Files Online', description: 'Create zip files directly in your browser.' },
  { slug: 'unzip-files-online', title: 'Unzip Files Online', description: 'Decompress zip archives without uploading.' },
  { slug: 'heic-convert', title: 'Convert HEIC to JPG', description: 'Turn HEIC photos into JPG format instantly.' },
  { slug: 'download-time-calculator', title: 'Download Time Calculator', description: 'Estimate how long a download will take.' },
  { slug: 'metadata-editor', title: 'File Metadata Editor', description: 'Edit any EXIF tag or audio ID3 metadata.' },
];

export function getRelatedTools(currentSlug, max = 3) {
  const others = tools.filter(t => t.slug !== currentSlug);
  return others.slice(0, max).map(t => ({ to: `/tools/${t.slug}`, title: t.title }));
}
