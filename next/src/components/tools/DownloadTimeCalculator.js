"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Input } from "../ui/input";

function format(seconds) {
  if (!seconds || !isFinite(seconds)) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return [h ? h + "h" : null, m ? m + "m" : null, s ? s + "s" : "Instantly ;)"]
    .filter(Boolean)
    .join(" ");
}

export default function DownloadCalculator() {
  const [size, setSize] = useState("");
  const [unit, setUnit] = useState("MB");
  const [speed, setSpeed] = useState("");
  const [speedUnit, setSpeedUnit] = useState("Mbps");

  // derived values
  const bytes = (parseFloat(size) || 0) * (unit === "GB" ? 1e9 : 1e6);
  const bps = (parseFloat(speed) || 0) * (speedUnit === "MBps" ? 1e6 * 8 : 1e6);
  const seconds = bps ? (bytes * 8) / bps : 0;

  return (
    <div className="border rounded-2xl p-6 shadow-sm w-full max-w-md bg-white grid gap-4">
      {/* Size */}
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
        />
        <Select value={unit} onValueChange={setUnit}>
          <SelectTrigger className="w-24">{unit}</SelectTrigger>
          <SelectContent>
            <SelectItem value="MB">MB</SelectItem>
            <SelectItem value="GB">GB</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Speed */}
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Speed"
          value={speed}
          onChange={(e) => setSpeed(e.target.value)}
        />
        <Select value={speedUnit} onValueChange={setSpeedUnit}>
          <SelectTrigger className="w-28">{speedUnit}</SelectTrigger>
          <SelectContent>
            <SelectItem value="Mbps">Mbps</SelectItem>
            <SelectItem value="MBps">MBps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-center text-sm text-gray-500">
        {seconds ? format(seconds) : "—"}
      </p>
    </div>
  );
}
