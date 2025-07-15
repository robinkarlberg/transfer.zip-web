import BIcon from "../BIcon"



function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function OnboardingSteps({timeline}) {
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {timeline.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== timeline.length - 1 ? (
                <span aria-hidden="true" className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={classNames(
                      event.done ? "bg-green-400" : "bg-gray-400",
                      'flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white',
                    )}
                  >
                    <BIcon center name={event.icon} aria-hidden="true" className="h-5 w-5 text-white" />
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      {event.content}{' '}
                      {/* <a href={event.href} className="font-medium text-gray-900">
                        {event.target}
                      </a> */}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    {event.target && (
                      <button onClick={event.onClick} className="bg-primary font-medium px-2 py-1 text-white rounded hover:bg-primary-light">{event.target}</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
