import { useMemo } from "react"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Checkmark from "../Checkmark";
import { Transition } from "@headlessui/react";

export default function Progress({ now, max }) {
  const percent = useMemo(() => !max ? 0 : Math.floor(now / max * 100), [now, max])

  const showCheckmark = max && max === now
  return (
    <div className="bg-red w-full h-full text-primary relative">
      <Transition show={showCheckmark}>
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center transition data-[closed]:opacity-0">
          <Checkmark />
        </div>
      </Transition>
      <Transition show={!showCheckmark}>
        <div className="absolute top-0 left-0 transition data-[closed]:opacity-0">
          <CircularProgressbar value={percent} text={max ? `${percent}%` : ""}
            styles={buildStyles({
              textSize: "16px",
              textColor: "currentColor",
              pathColor: "currentColor"
            })} />
        </div>
      </Transition>
    </div>
  )
}