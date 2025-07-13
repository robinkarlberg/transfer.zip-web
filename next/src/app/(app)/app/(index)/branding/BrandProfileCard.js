"use client"

import Image from "next/image";

export default BrandProfileCard = ({ id, name, iconUrl }) => {
  return (
    <div className="border shadow-sm rounded-lg bg-white border-gray-300">
      <div className="">
        {iconUrl ?
          <Image width={32} height={32} />
          :
          <div className="w-[32px] h-[32px] rounded-lg border-2 border-dashed border-gray-400">
            <BIcon name={"building-fill"} center />
          </div>
        }
      </div>
      <DashH4 className="font-semibold ">{capitalizeFirstLetter(name)}</DashH4>
      {/* {description && <span className=" text-sm text-gray-400">{description.slice(0, 100)}...</span>} */}
      <span className="text-sm text-gray-500"><BIcon name="command" className="mr-1" />{type}</span>
      <div className="flex-grow"></div>
      <div className="flex flex-row justify-between gap-2">
        <Button asChild className={"grow"} variant="outline"><Link href={`${id}`}>Customize</Link></Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={"w-10"} variant="outline"><BIcon center name={"three-dots-vertical"} /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* <DropdownMenuItem className={"cursor-pointer"}>Customize</DropdownMenuItem>
                            <DropdownMenuSeparator></DropdownMenuSeparator> */}
            <DropdownMenuItem onClick={handleDeleteAction} className={"cursor-pointer text-destructive"}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}