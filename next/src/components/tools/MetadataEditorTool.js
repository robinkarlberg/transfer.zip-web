"use client";

import { useState } from 'react';
import FileUpload from "../elements/FileUpload";

export default function MetadataEditorTool() {
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState(null);
  const [fields, setFields] = useState([]);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');

  const handleFiles = async (files) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    if (f.type.startsWith('image/')) {
      await new Promise(res => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/piexifjs';
        s.onload = res;
        document.head.appendChild(s);
      });
      const reader = new FileReader();
      reader.onload = () => {
        const exif = window.piexif.load(reader.result);
        const flds = [];
        ['0th','Exif','GPS','1st'].forEach(sec => {
          const secData = exif[sec];
          if (!secData) return;
          for (const tag in secData) {
            const info = window.piexif.TAGS[sec][tag];
            const name = info ? info.name : tag;
            let val = secData[tag];
            if (typeof val === 'object') val = JSON.stringify(val);
            flds.push({ section: sec, tag, name, value: String(val) });
          }
        });
        setFields(flds);
        setInfo({type:'image', dataURL: reader.result, exif});
      };
      reader.readAsDataURL(f);
    } else if (f.type === 'audio/mpeg') {
      await new Promise(res => {
        const s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/jsmediatags@3/dist/jsmediatags.min.js';
        s.onload = res;
        document.head.appendChild(s);
      });
      window.jsmediatags.read(f, {
        onSuccess: ({tags}) => {
          setTitle(tags.title || '');
          setArtist(tags.artist || '');
          setInfo({type:'audio'});
        },
        onError: console.error
      });
      setFields([]);
    }
  };

  const saveImage = () => {
    const exif = JSON.parse(JSON.stringify(info.exif));
    fields.forEach(f => {
      let val = f.value;
      try {
        val = JSON.parse(val);
      } catch {
        const num = Number(val);
        if (!Number.isNaN(num)) val = num;
      }
      if (!exif[f.section]) exif[f.section] = {};
      exif[f.section][f.tag] = val;
    });
    const exifStr = window.piexif.dump(exif);
    const newDataURL = window.piexif.insert(exifStr, info.dataURL);
    const a = document.createElement('a');
    a.href = newDataURL;
    a.download = file.name.replace(/\.jpe?g$/i, '_meta.jpg');
    a.click();
  };

  const saveAudio = async () => {
    await new Promise(res => { const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/browser-id3-writer'; s.onload=res; document.head.appendChild(s); });
    const buffer = await file.arrayBuffer();
    const writer = new window.ID3Writer(buffer);
    writer.setFrame('TIT2', title).setFrame('TPE1', [artist]);
    writer.addTag();
    const blob = writer.getBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.mp3$/i, '_meta.mp3');
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mx-auto max-w-sm">
        <FileUpload onFiles={handleFiles} buttonText="Select file" singleFile />
      </div>
      {info?.type==='image' && (
        <div className="mt-4 space-y-2">
          {fields.map((f, idx) => (
            <label key={idx} className="block">
              {f.section} {f.name}
              <input
                className="border rounded p-2 w-full"
                value={f.value}
                onChange={e => {
                  const newFields = [...fields];
                  newFields[idx].value = e.target.value;
                  setFields(newFields);
                }}
              />
            </label>
          ))}
          <button onClick={saveImage} className="mt-2 border rounded p-2 bg-primary text-white">Save Image</button>
        </div>
      )}
      {info?.type==='audio' && (
        <div className="mt-4 space-y-2">
          <label className="block">Title <input className="border p-2 rounded w-full" value={title} onChange={e=>setTitle(e.target.value)} /></label>
          <label className="block">Artist <input className="border p-2 rounded w-full" value={artist} onChange={e=>setArtist(e.target.value)} /></label>
          <button onClick={saveAudio} className="mt-2 border rounded p-2 bg-primary text-white">Save MP3</button>
        </div>
      )}
    </div>
  );
}
