"use client";

import { useMemo, useState } from "react";

function format(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return [
    h ? h + "h" : null,
    m ? m + "m" : null,
    (!h && !m) || s ? s + "s" : null,
  ].filter(Boolean).join(" ");
}

export default function DownloadTimeCalculator() {
  const [size, setSize] = useState(100);
  const [unit, setUnit] = useState("MB");
  const [speed, setSpeed] = useState(50);

  const seconds = useMemo(() => {
    const bytes = parseFloat(size || 0) * (unit === "GB" ? 1e9 : 1e6);
    const bits = bytes * 8;
    const bps = parseFloat(speed || 0) * 1e6;
    if (!bps) return 0;
    return bits / bps;
  }, [size, unit, speed]);

  return (
    <div className="border rounded-xl p-6 shadow-sm w-full max-w-md">
      <div className="flex gap-2 mb-4">
        <input type="number" className="border rounded p-2 w-full" value={size} onChange={e => setSize(e.target.value)} />
        <select className="border rounded p-2" value={unit} onChange={e => setUnit(e.target.value)}>
          <option>MB</option>
          <option>GB</option>
        </select>
      </div>
      <div className="flex gap-2 mb-4">
        <input type="number" className="border rounded p-2 w-full" value={speed} onChange={e => setSpeed(e.target.value)} />
        <span className="self-center">Mbps</span>
      </div>
      <p className="font-semibold text-center">Estimated time: {format(seconds)}</p>
    </div>
  );
}
