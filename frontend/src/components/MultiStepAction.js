import BIcon from "./BIcon";

export default function MultiStepAction({ steps }) {
  return (
    <div>
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {steps.map((entry) =>
          <li key={entry.step} className="border shadow-sm rounded-xl p-5">
            <div className="mb-1">
              <BIcon className={"text-3xl text-primary"} name={entry.icon} />
            </div>
            <h3 className="text-2xl font-semibold mb-0 text-gray-800">Step {entry.step}</h3>
            <p className="text-gray-600">{entry.text}</p>
          </li>)}
      </ul>
    </div>
  )
}