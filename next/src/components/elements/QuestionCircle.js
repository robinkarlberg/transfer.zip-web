import BIcon from "../BIcon";

export default function QuestionCircle({ text, className }) {
  return (
    <span className="relative group">
      <div className="pointer-events-none absolute bg-white text-stone-600 font-normal text-sm shadow-sm px-4 py-3 rounded-lg border border-stone-300 hidden group-hover:block left-0 bottom-0 w-60 mb-6 z-20">
        {text}
      </div>
      <BIcon name={"question-circle"} className={"text-stone-400 " + className} />
    </span>
  )
}