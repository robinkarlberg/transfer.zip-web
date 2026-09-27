import { cn } from "@/lib/utils"
import { FilmIcon, ImageIcon, MusicIcon } from "lucide-react"

// Resting, hovered and "files incoming" poses for the three cards
const TILES = [
  {
    Icon: ImageIcon,
    color: "bg-primary-100 text-primary-600",
    rest: "-translate-x-8 -rotate-12 group-hover:-translate-x-11 group-hover:-rotate-[18deg]",
    open: "-translate-x-14 -translate-y-3 -rotate-[24deg]",
  },
  {
    Icon: MusicIcon,
    color: "bg-comp-100 text-comp-600",
    rest: "translate-x-8 rotate-12 group-hover:translate-x-11 group-hover:rotate-[18deg]",
    open: "translate-x-14 -translate-y-3 rotate-[24deg]",
  },
  {
    Icon: FilmIcon,
    color: "bg-white text-primary-500",
    rest: "-translate-y-1 group-hover:-translate-y-3",
    open: "-translate-y-6 scale-110",
  },
]

export function FileStack({ open }) {
  return (
    <div className={cn("relative h-20 w-44", open && "animate-bob")}>
      {TILES.map(({ Icon, color, rest, open: openPose }) => (
        <div
          key={color}
          className={cn(
            "absolute top-2 left-1/2 -ml-8 grid size-16 place-items-center rounded-2xl shadow-md ring-1 ring-gray-200 transition-transform duration-300 ease-out",
            color,
            open ? openPose : rest
          )}
        >
          <Icon size={26} strokeWidth={1.75} />
        </div>
      ))}
    </div>
  )
}

export function DashedOutline({ active, radius = 16 }) {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-px size-[calc(100%-2px)] overflow-visible">
      <rect
        width="100%"
        height="100%"
        rx={radius}
        className={cn("fill-none transition-colors duration-300", active ? "animate-march stroke-primary-500" : "stroke-gray-300")}
        strokeWidth={2}
        strokeDasharray="8 8"
      />
    </svg>
  )
}

// Fills the nearest positioned parent. radius should match that parent's rounding.
// pt-6 offsets the open tiles floating upward, so the whole thing reads as centered.
export default function FileDropOverlay({ label = "Let go to add them", radius = 16 }) {
  return (
    <div style={{ borderRadius: radius }} className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-primary-50 pt-6 animate-in fade-in duration-200">
      <DashedOutline active radius={radius} />
      <FileStack open />
      <p className="mt-8 text-lg font-semibold text-gray-900">{label}</p>
    </div>
  )
}
