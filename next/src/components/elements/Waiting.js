import BIcon from "../BIcon";
import Spinner from "./Spinner";

export default function Waiting({ title, children, completeTitle, complete }) {
  return (
    <div className="rounded-md border bg-blue-50 p-4 shadow">
      <div className="flex">
        <div className="flex-shrink-0 text-blue-800">
          {complete ?
            <BIcon name={"check-lg"} />
            :
            <Spinner />
          }

        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">{complete ? completeTitle : title}</h3>
          {!complete && (
            <div className="mt-2 text-sm text-blue-700">
              <p>
                {children}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
