import BIcon from "../BIcon";

export default function Alert({ title, children }) {
  return (
    <div className="rounded-md border bg-yellow-50 p-4 shadow">
      <div className="flex">
        <div className="flex-shrink-0">
          <BIcon name={"exclamation-triangle-fill"} aria-hidden="true" className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">{title}</h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              {children}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
