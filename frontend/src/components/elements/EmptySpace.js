export default function EmptySpace({ title, subtitle, onClick, buttonText }) {
  return (
    <div className="text-center py-16 rounded-xl border-dashed border-2">
      <h3 className="font-semibold text-2xl mb-1">{title}</h3>
      <p className="text-gray-600">
        {subtitle}
      </p>
      {onClick && <button className="mt-4 bg-primary px-2 py-1 text-white rounded-lg shadow-sm hover:bg-primary-light" onClick={onClick}>{buttonText} &rarr;</button>}
    </div>
  )
}