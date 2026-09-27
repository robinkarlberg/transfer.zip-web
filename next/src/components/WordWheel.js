"use client"

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { useEffect, useRef, useState } from "react"

const WORDS = ["easiest", "fastest", "safest", "simplest", "ethical", "private"]
const STEP = 360 / WORDS.length
// Drum radius where adjacent faces (1.12em tall) meet edge to edge
const RADIUS = 0.56 / Math.tan(Math.PI / WORDS.length)

function faceAngle(rotation, index) {
  return ((((rotation - index * STEP) % 360) + 540) % 360) - 180
}

function Face({ word, index, rotation, faceRef }) {
  const transform = useTransform(rotation, r =>
    `translateX(-50%) translateZ(-${RADIUS}em) rotateX(${faceAngle(r, index)}deg) translateZ(${RADIUS}em)`
  )
  // Fully transparent one slot away, so neighbors can't peek into the clip slack at rest
  const opacity = useTransform(rotation, r => Math.cos(Math.min(1, Math.abs(faceAngle(r, index)) / STEP) * Math.PI / 2))

  // Text lives in a pseudo-element so the h1's text content stays a single word
  return (
    <motion.span
      ref={faceRef}
      aria-hidden="true"
      data-word={word}
      className="absolute left-1/2 top-0 whitespace-nowrap before:content-[attr(data-word)]"
      style={{ transform, opacity }}
    />
  )
}

export default function WordWheel() {
  const [index, setIndex] = useState(0)
  const rotation = useMotionValue(0)
  const target = useRef({ index: 0, rotation: 0 })
  const boxRef = useRef(null)
  const faceRefs = useRef([])
  const reduceMotion = useReducedMotion()
  const inView = useInView(boxRef, { once: true, margin: "0px 0px -15% 0px" })

  const spin = () => {
    const next = (target.current.index + 1 + Math.floor(Math.random() * (WORDS.length - 1))) % WORDS.length
    const steps = (next - target.current.index + WORDS.length) % WORDS.length
    target.current = { index: next, rotation: target.current.rotation + 360 + steps * STEP }
    setIndex(next)

    const width = faceRefs.current[next].offsetWidth
    if (reduceMotion) {
      rotation.set(target.current.rotation)
      boxRef.current.style.width = `${width}px`
      return
    }
    animate(rotation, target.current.rotation, { type: "spring", visualDuration: 1.1, bounce: 0.3 })
    animate(boxRef.current, { width }, { type: "spring", visualDuration: 0.7, bounce: 0.35 })
  }

  useEffect(() => {
    if (!inView || reduceMotion) return
    const timeout = setTimeout(spin, 600)
    return () => clearTimeout(timeout)
  }, [inView])

  return (
    <button type="button" onClick={spin} className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
      <span
        ref={boxRef}
        className="relative inline-block"
        style={{ perspective: "6em", clipPath: "inset(-0.05em -0.15em)" }}
      >
        <span className="whitespace-nowrap text-transparent">{WORDS[index]}</span>
        {WORDS.map((word, i) => (
          <Face key={word} word={word} index={i} rotation={rotation} faceRef={el => faceRefs.current[i] = el} />
        ))}
      </span>
    </button>
  )
}
