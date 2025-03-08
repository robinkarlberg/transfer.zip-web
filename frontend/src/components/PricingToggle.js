import { Radio, RadioGroup } from "@headlessui/react"
import { useState } from "react"


const periods = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: <span>Yearly <span className="text-white ms-1 bg-purple-500 rounded-full px-1.5 py-0.5">SAVE 37%</span></span> },
]

export default function PricingToggle({ onChange }) {
  const [frequency, _setFrequency] = useState(periods[0])
  const setFrequency = f => {
    _setFrequency(f)
    onChange(f.value)
  }

  return (
    <div className="flex justify-center">
      <fieldset aria-label="Payment frequency">
        <RadioGroup
          value={frequency}
          onChange={setFrequency}
          className="flex gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200 bg-white"
        >
          {periods.map((option) => (
            <Radio
              key={option.value}
              value={option}
              className="cursor-pointer rounded-full px-2.5 py-1 text-gray-500 data-[checked]:bg-primary data-[checked]:text-white"
            >
              {option.label}
            </Radio>
          ))}
        </RadioGroup>
      </fieldset>
    </div>
  )
}