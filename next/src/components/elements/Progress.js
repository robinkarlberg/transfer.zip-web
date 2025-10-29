import { useMemo } from "react"
import { buildStyles, CircularProgressbar, CircularProgressbarWithChildren } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Checkmark from "../Checkmark";
import { Transition } from "@headlessui/react";
import { humanFileSizePair, humanFileSizeWithUnit } from "@/lib/transferUtils";
import Spinner from "./Spinner";
import Cross from "../Cross";

export default function Progress({ now, max, showUnits, autoFinish, finished, finishedText, failed }) {
  const percent = useMemo(() => !max ? 0 : Math.floor(now / max * 100), [now, max])

  const humanMax = humanFileSizePair(max, true)
  const humanNowAmount = humanFileSizeWithUnit(now, humanMax.unit, true, 1)

  // const showCheckmark = 
  return (
    <div className={`w-full h-full relative ${failed ? "text-red-500" : "text-primary"}`}>
      {
        failed ?
          (
            <Transition show={true}>
              <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center transition data-[closed]:opacity-0">
                <Cross />
                <div className="text-center font-bold">
                  Unfortunately, there was an error.
                </div>
              </div>
            </Transition>
          ) : <>
            <Transition show={!!autoFinish ? max && max === now : finished}>
              <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center transition data-[closed]:opacity-0">
                <Checkmark />
                <div className="text-center font-bold">
                  {finishedText}
                </div>
              </div>
            </Transition>
            <Transition show={!autoFinish && (max && max === now) && !finished}>
              <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center transition data-[closed]:opacity-0">
                <Spinner className={"text-primary"} sizeClassName={"w-16 h-16"} />
                <div className="mt-5 text-center">
                  Processing files...
                </div>
              </div>
            </Transition>
            <Transition show={max && max !== now}>
              <div className="absolute top-0 left-0 transition data-[closed]:opacity-0">
                <CircularProgressbarWithChildren value={percent} text={max ? `${percent}%` : ""}
                  styles={buildStyles({
                    textSize: "16px",
                    textColor: "currentColor",
                    pathColor: "currentColor"
                  })} >
                  {showUnits && <span className="text-sm mt-12 text-gray-500">{humanNowAmount} of {humanMax.amount}{humanMax.unit}</span>}
                </CircularProgressbarWithChildren>
              </div>
            </Transition>
          </>
      }

    </div>
  )
}