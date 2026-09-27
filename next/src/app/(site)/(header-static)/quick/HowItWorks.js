"use client"

import { cn } from "@/lib/utils"
import { LinkIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import CloudBank from "@/components/quick/CloudBank"
import Flight, { CheckBadge } from "@/components/quick/Flight"

const STEPS = [
  { title: "Pick files", text: "Any size, any type." },
  { title: "Share the link", text: "Or use the QR code or 6-digit code." },
  { title: "They get the files", text: "Keep this tab open until it's done." },
]

// Scenes: 0 empty, 1 files on the laptop, 2 link shared, 3 plane in the air, 4 landed
const SCENE_MS = [1000, 2200, 2200, 1600, 2600]
const SCENE_STEP = [-1, 0, 1, 2, 2]
const FLIGHT_MS = 1600

const ROUTE = { from: [158, 74], via: [362, -30], to: [569, 58] }
const LAPTOP_PHOTOS = [109, 144, 179]
const PHONE_PHOTOS = [96, 124, 152]
const PHOTO_FILLS = ["fill-primary-400", "fill-comp-400", "fill-primary-300"]

const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// Springy pop used for everything that appears in the scene
const POP = "origin-center transition duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] [transform-box:fill-box]"

function Photo({ x, y, width, height, fill, className, style }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className} style={style}>
        <rect width={width} height={height} rx={4} className={fill} />
        <circle cx={width * 0.72} cy={height * 0.3} r={height * 0.13} className="fill-white" />
        <path
          d={`M${width * 0.1} ${height * 0.88} L${width * 0.38} ${height * 0.45} L${width * 0.56} ${height * 0.7} L${width * 0.7} ${height * 0.55} L${width * 0.9} ${height * 0.88} Z`}
          className="fill-white"
        />
      </g>
    </g>
  )
}

export default function HowItWorks() {
  const sceneRef = useRef(null)
  const [scene, setScene] = useState(0)
  const [flight, setFlight] = useState(0)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 })
    observer.observe(sceneRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setScene(4)
      setFlight(1)
      return
    }
    if (!inView) return

    let timer
    let frame
    const play = next => {
      setScene(next)
      // Reset the plane only after the route has been swept away in scene 0
      if (next === 1) setFlight(0)
      if (next === 3) {
        const start = performance.now()
        const fly = now => {
          const t = Math.min((now - start) / FLIGHT_MS, 1)
          setFlight(easeInOut(t))
          if (t < 1) frame = requestAnimationFrame(fly)
        }
        frame = requestAnimationFrame(fly)
      }
      timer = setTimeout(() => play((next + 1) % SCENE_MS.length), SCENE_MS[next])
    }
    play(0)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [inView])

  const activeStep = SCENE_STEP[scene]

  return (
    <section id="how-it-works" className="relative isolate scroll-mt-24 px-4 pt-8 pb-24 sm:pb-32">
      {/* The sky ends here: it sinks into the clouds behind the card and comes out white */}
      <CloudBank className="absolute inset-x-0 bottom-0 -z-10 h-[576px] w-full sm:h-[max(720px,37vw)]" />
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-4xl font-bold tracking-tight text-white text-shadow-sm sm:text-5xl">How it works</h2>
        <div className="mt-10 rounded-3xl bg-white p-2 shadow-xl sm:p-3">
          <div ref={sceneRef} className="overflow-hidden rounded-2xl bg-linear-to-b from-primary-100 to-primary-50">
            <svg viewBox="0 0 720 236" className="block w-full" aria-hidden="true">
              <ellipse cx={158} cy={206} rx={92} ry={9} className="fill-primary-200" />
              <ellipse cx={569} cy={202} rx={46} ry={8} className="fill-primary-200" />

              {/* Laptop */}
              <rect x={96} y={96} width={124} height={82} rx={10} className="fill-white stroke-gray-900" strokeWidth={3} />
              <rect x={104} y={104} width={108} height={66} rx={5} className="fill-primary-50" />
              <path d="M80 180 H236 L228 191 Q226 194 222 194 H94 Q90 194 88 191 Z" className="fill-white stroke-gray-900" strokeWidth={3} strokeLinejoin="round" />
              {LAPTOP_PHOTOS.map((x, i) => (
                <Photo
                  key={x}
                  x={x}
                  y={126}
                  width={28}
                  height={22}
                  fill={PHOTO_FILLS[i]}
                  className={cn(POP, scene >= 1 ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0")}
                  style={{ transitionDelay: `${scene >= 1 ? i * 140 : 0}ms` }}
                />
              ))}

              {/* Phone */}
              <rect x={537} y={78} width={64} height={112} rx={12} className="fill-white stroke-gray-900" strokeWidth={3} />
              <rect x={544} y={88} width={50} height={92} rx={6} className="fill-primary-50" />
              {PHONE_PHOTOS.map((y, i) => (
                <Photo
                  key={y}
                  x={550}
                  y={y}
                  width={38}
                  height={22}
                  fill={PHOTO_FILLS[i]}
                  className={cn(POP, scene === 4 ? "scale-100 opacity-100" : "scale-50 opacity-0")}
                  style={{ transitionDelay: `${scene === 4 ? 150 + i * 140 : 0}ms` }}
                />
              ))}
              {scene === 4 && <CheckBadge x={601} y={80} r={13} />}

              <Flight {...ROUTE} progress={flight} drawn={scene >= 2} hidePlane={scene < 2 || scene === 4} hovering={scene === 2} scale={1.3} />

              {/* The shared link */}
              <g className={cn(POP, scene === 2 ? "scale-100 opacity-100" : "scale-0 opacity-0")}>
                <rect x={304} y={104} width={116} height={36} rx={18} className="fill-white stroke-gray-900" strokeWidth={2.5} />
                <LinkIcon x={318} y={112} width={20} height={20} className="text-primary-600" />
                <rect x={346} y={114} width={58} height={5} rx={2.5} className="fill-gray-300" />
                <rect x={346} y={124} width={38} height={5} rx={2.5} className="fill-gray-200" />
              </g>
            </svg>
          </div>
          <ol className="grid gap-4 p-4 sm:grid-cols-3 sm:gap-6 sm:p-6">
            {STEPS.map(({ title, text }, i) => (
              <li key={title} className="flex gap-3">
                <span className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold transition-colors duration-500",
                  activeStep === i ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                )}>
                  {i + 1}
                </span>
                <div>
                  <p className={cn("font-semibold transition-colors duration-500", activeStep === i ? "text-gray-900" : "text-gray-500")}>{title}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
