import { Button } from "../ui/button";

export default function EmptySpace({ title, subtitle, onClick, buttonText, children }) {
  return (
    <div className="text-center py-16 rounded-xl border-dashed border-2">
      <h3 className="font-semibold text-2xl mb-1">{title}</h3>
      <p className="text-gray-600 mx-auto max-w-xl">
        {subtitle}
      </p>
      {onClick && <Button size={"sm"} className="mt-4" onClick={onClick}>{buttonText} &rarr;</Button>}
      {children}
    </div>
  )
}