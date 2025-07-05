"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { Input } from "../ui/input";

const presets = [
  { id: "custom", label: "Custom", speed: "", unit: "Mbps" },
  { id: "3g", label: "3G (~3.6 Mbps)", speed: 3.6, unit: "Mbps" },
  { id: "4g", label: "4G LTE (~20 Mbps)", speed: 20, unit: "Mbps" },
  { id: "5g", label: "5G (~100 Mbps)", speed: 100, unit: "Mbps" },
  { id: "wifi", label: "Wi-Fi (~100 Mbps)", speed: 100, unit: "Mbps" },
  { id: "fiber", label: "Fiber (1 Gbps)", speed: 1000, unit: "Mbps" },
];

function format(seconds) {
  if (!seconds || !isFinite(seconds)) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return [h ? h + "h" : null, m ? m + "m" : null, s ? s + "s" : "🏎️💨 Instantly!"]
    .filter(Boolean)
    .join(" ");
}

export default function DownloadCalculator() {
  const [size, setSize] = useState("");
  const [unit, setUnit] = useState("MB");
  const [speed, setSpeed] = useState("");
  const [speedUnit, setSpeedUnit] = useState("Mbps");
  const [preset, setPreset] = useState("custom");

  const bytes = (parseFloat(size) || 0) * (unit === "GB" ? 1e9 : 1e6);
  const bps = (parseFloat(speed) || 0) * (speedUnit === "MBps" ? 1e6 * 8 : 1e6);
  const seconds = bps ? (bytes * 8) / bps : 0;

  const handlePresetChange = (value) => {
    setPreset(value);
    const p = presets.find((p) => p.id === value);
    if (p) {
      setSpeed(p.speed.toString());
      setSpeedUnit(p.unit);
    }
  };

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

      {/* Speed Preset */}
      <div className="flex gap-2">
        <Select value={preset} onValueChange={handlePresetChange}>
          <SelectTrigger className="flex-1">{presets.find(p => p.id === preset).label}</SelectTrigger>
          <SelectContent>
            {presets.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Speed */}
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Speed"
          value={speed}
          onChange={(e) => {
            setSpeed(e.target.value);
            setPreset("custom");
          }}
        />
        <Select value={speedUnit} onValueChange={(value) => {
          setSpeedUnit(value);
          setPreset("custom");
        }}>
          <SelectTrigger className="w-28">{speedUnit}</SelectTrigger>
          <SelectContent>
            <SelectItem value="Mbps">Mbps</SelectItem>
            <SelectItem value="MBps">MBps</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="mt-2 text-center text-lg text-gray-800 font-medium">
        {seconds ? format(seconds) : "—"}
      </p>
    </div>
  );
}
