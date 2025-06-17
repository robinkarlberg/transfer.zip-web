import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import BIcon from '../BIcon'
import Link from 'next/link'

export default function Dropdown({ title, items, className, ...props }) {
  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`} {...props}>
      <div>
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          {title}
          <BIcon name="chevron-down" aria-hidden="true" className="-mr-1 size-5 text-gray-400" />
        </MenuButton>
      </div>

      <MenuItems
        transition
        anchor="bottom start"
        className="absolute left-0 z-10 mb-2 w-56 origin-bottom-left --origin-top-left divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        {items.map((group, groupIndex) => (
          <div className="py-1" key={groupIndex}>
            {group.map((item, itemIndex) => (
              <MenuItem key={itemIndex}>
                <Link
                  onClick={item.onClick}
                  to={item.onClick ? "#" : item.to}
                  className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                >
                  {item.title}
                </Link>
              </MenuItem>
            ))}
          </div>
        ))}
      </MenuItems>
    </Menu>
  )
}
