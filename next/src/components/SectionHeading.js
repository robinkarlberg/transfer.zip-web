import { cn } from "@/lib/utils"

export default function SectionHeading({ eyebrow, title, description, dark, align = "center" }) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      <p className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset",
        dark ? "bg-gray-900 text-primary-300 ring-gray-700" : "bg-primary-50 text-primary-700 ring-primary-100"
      )}>
        {eyebrow}
      </p>
      <h2 className={cn(
        "mt-4 text-pretty text-4xl font-bold tracking-tight sm:text-5xl lg:text-balance",
        dark ? "text-white" : "text-gray-900"
      )}>
        {title}
      </h2>
      {description && (
        <p className={cn("mt-6 text-pretty text-lg/8", dark ? "text-gray-400" : "text-gray-600")}>
          {description}
        </p>
      )}
    </div>
  )
}
