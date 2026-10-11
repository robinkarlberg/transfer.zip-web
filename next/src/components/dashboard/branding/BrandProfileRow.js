
"use client"

import { useLanguage } from "@/context/LanguageContext"
import Image from "next/image";
import Link from "next/link";
import { ChevronRightIcon, HexagonIcon, ImageIcon } from "lucide-react";

import { capitalizeFirstLetter } from "@/lib/utils";

export default function BrandProfileRow({ name, iconUrl, backgroundUrl, editHref }) {
  const { t } = useLanguage()
  return (
    <Link
      href={editHref}
      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50"
    >
      <div className="flex-shrink-0">
        {iconUrl ? (
          <Image className="rounded-md" alt={t("Brand icon")} width={32} height={32} src={iconUrl} />
        ) : (
          <HexagonIcon className="w-[32px] h-[32px] p-1.5 rounded-lg border-2 border-dashed border-gray-400" />
        )}
      </div>

      <p className="flex-1 min-w-0 text-gray-900 font-semibold truncate">
        {capitalizeFirstLetter(name)}
      </p>

      <div className="flex-shrink-0 relative aspect-video w-28 rounded-md overflow-clip border border-gray-100 bg-gray-50 flex items-center justify-center">
        {backgroundUrl ? (
          <Image
            fill
            className="object-cover object-center pointer-events-none transition-transform"
            src={backgroundUrl}
            alt={t("Brand background")}
          />
        ) : (
          <ImageIcon className="w-5 h-5 text-gray-300" />
        )}
      </div>

      <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
    </Link>
  );
}
