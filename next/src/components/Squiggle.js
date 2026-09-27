import { cn } from "@/lib/utils"

export default function Squiggle({ children, className }) {
  return (
    <span className="relative whitespace-nowrap">
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        className={cn("absolute left-0 bottom-[0.08em] w-full", className)}
        style={{ height: "0.15em" }}
        viewBox="0 0 100 20"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 15 C 20 22, 40 5, 60 12 S 90 18, 98 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ vectorEffect: "non-scaling-stroke" }}
        />
      </svg>
    </span>
  )
}
