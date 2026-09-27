"use client"

import { useEffect, useRef } from "react"

const GLYPHS = "0123456789abcdef"
const CELL_W = 14
const CELL_H = 20
const TICK_MS = 50

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

export default function CipherField({ active }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const style = getComputedStyle(canvas)
    const coldColor = style.getPropertyValue("--cipher-cold")
    // primary-* comes from the JS config, which Tailwind inlines instead of exposing as a CSS variable
    const hotColor = style.color
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let cols, rows, glyphs, heat, packets

    const spawnPacket = anywhere => ({
      row: Math.floor(Math.random() * rows),
      col: anywhere ? Math.floor(Math.random() * cols) : -Math.floor(Math.random() * 40),
    })

    const drawCell = i => {
      const x = (i % cols) * CELL_W
      const y = Math.floor(i / cols) * CELL_H
      ctx.clearRect(x, y, CELL_W, CELL_H)
      ctx.globalAlpha = 1
      ctx.fillStyle = coldColor
      ctx.fillText(glyphs[i], x + CELL_W / 2, y + CELL_H / 2)
      if (heat[i] > 0) {
        ctx.globalAlpha = heat[i]
        ctx.fillStyle = hotColor
        ctx.fillText(glyphs[i], x + CELL_W / 2, y + CELL_H / 2)
      }
    }

    const resize = () => {
      const { innerWidth: w, innerHeight: h, devicePixelRatio: dpr } = window
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `13px ${style.fontFamily}`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      cols = Math.ceil(w / CELL_W)
      rows = Math.ceil(h / CELL_H)
      glyphs = Array.from({ length: cols * rows }, randomGlyph)
      heat = new Float32Array(cols * rows)
      packets = Array.from({ length: Math.ceil(rows / 5) }, () => spawnPacket(true))
      for (let i = 0; i < glyphs.length; i++) drawCell(i)
    }

    const tick = () => {
      const dirty = new Set()
      for (let n = Math.ceil(glyphs.length * 0.01); n > 0; n--) {
        const i = Math.floor(Math.random() * glyphs.length)
        glyphs[i] = randomGlyph()
        dirty.add(i)
      }
      for (let i = 0; i < heat.length; i++) {
        if (heat[i] === 0) continue
        heat[i] = heat[i] < 0.03 ? 0 : heat[i] * 0.86
        dirty.add(i)
      }
      packets = packets.map(p => {
        p.col++
        if (p.col >= cols) return spawnPacket(false)
        if (p.col >= 0) {
          const i = p.row * cols + p.col
          heat[i] = 1
          glyphs[i] = randomGlyph()
          dirty.add(i)
        }
        return p
      })
      dirty.forEach(drawCell)
    }

    let frame
    let last = 0
    const loop = now => {
      if (now - last >= TICK_MS) {
        last = now
        tick()
      }
      frame = requestAnimationFrame(loop)
    }

    resize()
    if (!reduceMotion) frame = requestAnimationFrame(loop)
    window.addEventListener("resize", resize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 size-full font-mono text-primary-500 [--cipher-cold:var(--color-gray-800)]"
    />
  )
}
