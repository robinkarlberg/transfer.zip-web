import Link from 'next/link'
import BIcon from "./BIcon"

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function PricingCards({ tiers, compact, buttonText, onTierSelected }) {
  const _buttonText = buttonText ?? "Get started today"
  return tiers.map((tier, tierIdx) => (
    <div
      key={tier.name}
      className={classNames(
        tier.featured ? 'relative bg-gray-900 shadow-2xl' : 'bg-white/60 sm:mx-8 lg:mx-0',
        tier.featured
          ? ''
          : tierIdx === 0
            ? 'rounded-t-3xl sm:rounded-b-none lg:rounded-bl-3xl lg:rounded-tr-none'
            : 'sm:rounded-t-none lg:rounded-bl-none lg:rounded-tr-3xl',
        'rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10 sm:min-w-96',
      )}
    >
      <h3
        id={tier.id}
        className={classNames(tier.featured ? 'text-primary-lighter' : 'text-primary', 'text-base/7 font-semibold')}
      >
        {tier.name}
      </h3>
      <p className="mt-4 flex items-baseline gap-x-2">
        <span
          className={classNames(
            tier.featured ? 'text-white' : 'text-gray-900',
            'text-5xl font-semibold tracking-tight',
          )}
        >
          {tier.price}
        </span>
        <span className={classNames(tier.featured ? 'text-gray-400' : 'text-gray-500', 'text-base')}>{tier.lifetime ? "once" : "/month"}</span>
      </p>
      {!compact && (<p className={classNames(tier.featured ? 'text-gray-300' : 'text-gray-600', 'mt-6 text-base/7')}>
        {tier.description}
      </p>)}
      <ul
        role="list"
        className={classNames(
          tier.featured ? 'text-gray-300' : 'text-gray-600',
          'mt-8 space-y-3 text-sm/6 sm:mt-10',
        )}
      >
        {tier.features.map((feature, index) => (
          <li key={index} className="flex gap-x-3">
            <BIcon
              name={"check-lg"}
              aria-hidden="true"
              className={classNames(tier.featured ? 'text-primary-lighter' : 'text-primary', 'h-6 w-5 flex-none')}
            />
            {feature}
          </li>
        ))}
      </ul>
      <Link
        href={"/signup"}
        aria-describedby={tier.name}
        className={classNames(
          tier.featured
            ? 'bg-primary-light text-white shadow-sm hover:bg-primary-lighter focus-visible:outline-primary-light'
            : 'text-primary ring-1 ring-inset ring-primary-200 hover:ring-primary-300 focus-visible:outline-primary',
          'mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:mt-10',
        )}
      >
        {_buttonText}
      </Link>
    </div>
  ))
}