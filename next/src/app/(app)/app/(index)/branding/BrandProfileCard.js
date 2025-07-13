import BIcon from "@/components/BIcon";
import { capitalizeFirstLetter } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

import transfer_zip_grid from "@/img/transfer-zip-grid.png"

export default function ({ id, name, iconUrl, backgroundUrl }) {
  return (
    <Link href={`/app/branding/${id}`} className="border shadow-xs rounded-xl bg-white border-gray-200 p-4 hover:bg-gray-50 group">
      <div className="flex items-center gap-2">
        <div className="">
          {iconUrl ?
            <Image alt="Company Logo" width={32} height={32} src={iconUrl} />
            :
            <div className="w-[32px] h-[32px] rounded-lg border-2 border-dashed border-gray-400">
              <BIcon name={"building-fill"} center />
            </div>
          }
        </div>
        <p className="text-gray-800 text-lg font-bold whitespace-nowrap text-ellipsis overflow-x-hidden">{capitalizeFirstLetter(name)}</p>
      </div>
      <div className="rounded-lg border border-gray-100 mt-2">
        <div className="relative aspect-video rounded-md overflow-clip flex justify-center items-center">
          <Image
            layout="fill"
            className="object-center object-cover pointer-events-none group-hover:scale-105 transition-transform duration-300"
            src={backgroundUrl || transfer_zip_grid}
            alt={"Brand Profile Background Image"}
          />
          {!backgroundUrl && <p className="relative text-gray-300">
            No background
          </p>}
        </div>
      </div>
      {/* <div className="flex flex-row justify-between gap-2">
        <Button asChild className={"grow"} variant="outline"><Link href={`branding/${id}`}>Customize</Link></Button>
      </div> */}
    </Link>
  )
}