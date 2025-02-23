export default function EmptySpace({ title, subtitle }) {
  return (
    <div className="text-center py-16 rounded-xl border-dashed border-2">
      <h3 className="font-semibold text-2xl mb-1">{title}</h3>
      <p className="text-gray-600">
        {subtitle}
      </p>
    </div>
  )
}