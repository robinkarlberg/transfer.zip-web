"use client"

import { capitalizeFirstLetter } from "@/lib/utils"
import { Radio, RadioGroup } from "@headlessui/react"

export default function ({ frequency, setFrequency }) {
  return (
    <div className="flex justify-center">
      <fieldset aria-label="Payment frequency">
        <RadioGroup
          value={frequency}
          onChange={setFrequency}
          className="bg-white flex gap-x-1 rounded-full p-1 text-center text-sm font-semibold leading-5 ring-1 ring-inset ring-gray-200"
        >
          {["yearly", "monthly"].map(value => (
            <Radio
              key={value}
              value={value}
              defaultChecked={value == frequency}
              className="cursor-pointer rounded-full px-2.5 py-1 text-gray-600 data-[checked]:bg-primary-600 data-[checked]:text-white group flex items-center"
            >
              {capitalizeFirstLetter(value)}{value == "yearly" && <span className="inline-block ml-2 text-xs border border-amber-500 bg-amber-100 text-amber-600 group-data-[checked]:bg-primary-50 group-data-[checked]:text-primary group-data-[checked]:border-0 px-1 rounded-full">SAVE 33%</span>}
            </Radio>
          ))}
        </RadioGroup>
      </fieldset>
    </div>
  )
}