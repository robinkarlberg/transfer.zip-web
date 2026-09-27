import RealCloud from "./RealCloud"

const WIDTH = 1600
const HEIGHT = 500
// Empty sky above the tallest puff for the haze to fade out in
const HEADROOM = 220

// Deterministic "random" so server and client draw the same clouds
const random = (seed => () => {
  seed = (seed * 16807) % 2147483647
  return seed / 2147483647
})(11)

const bell = (x, spread) => Math.exp(-((x - WIDTH / 2) ** 2) / (2 * spread ** 2))

// A row of puffs whose bottoms sit around `floor`, growing towards the middle
const row = ({ from, to, step, size, peak, spread, floor, jitter }) => {
  const puffs = []
  for (let x = from; x <= to; x += step) {
    const r = Math.round(size + peak * bell(x, spread) + random() * jitter)
    puffs.push([Math.round(x + (random() - 0.5) * step * 0.6), Math.round(floor - r * 0.7), r])
  }
  return puffs
}

// Back to front, each row tucking in the bottoms of the one behind it
const PUFFS = [
  ...row({ from: 160, to: 1440, step: 85, size: 55, peak: 95, spread: 380, floor: 300, jitter: 25 }),
  ...row({ from: -120, to: 1720, step: 95, size: 60, peak: 40, spread: 600, floor: 360, jitter: 30 }),
  ...row({ from: -160, to: 1760, step: 120, size: 75, peak: 0, spread: 1, floor: 430, jitter: 30 }),
]

/** Bank of cumulus the sky sinks into, fading into the white page below. */
export default function CloudBank({ className }) {
  return (
    <RealCloud
      viewBox={`0 ${-HEADROOM} ${WIDTH} ${HEIGHT + HEADROOM}`}
      preserveAspectRatio="xMidYMax slice"
      puffs={PUFFS}
      base={[-400, 380, WIDTH + 800, HEIGHT]}
      className={className}
    />
  )
}
