import BIcon from "../BIcon";

export default function QuestionCircle({ text, className }) {
  return (
    <span className="relative group">
      <div className="pointer-events-none absolute bg-white text-gray-600 font-normal text-sm shadow-sm px-3 py-2 rounded-lg border opacity-0 group-hover:opacity-100 transition-all left-50 bottom-0 w-52 mb-6">
        {text}
      </div>
      <BIcon name={"question-circle-fill"} className={className} />
    </span>
  )
}