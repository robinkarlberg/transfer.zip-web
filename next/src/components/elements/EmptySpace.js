import { Button } from "../ui/button";

export default function EmptySpace({ title, subtitle, onClick, buttonText, children }) {
  return (
    <div className="text-center py-16 rounded-xl border-dashed border-2 backdrop-blur">
      <h3 className="font-semibold text-3xl mb-1 text-white">{title}</h3>
      <p className="text-gray-200 mx-auto max-w-xl text-lg">
        {subtitle}
      </p>
      {onClick && <Button size={"sm"} className="mt-4" onClick={onClick}>{buttonText} &rarr;</Button>}
      {children}
    </div>
  )
}