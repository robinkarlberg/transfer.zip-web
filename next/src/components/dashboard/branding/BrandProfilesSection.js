
"use client"

import { useLanguage } from "@/context/LanguageContext"
import Link from "next/link";
import BIcon from "@/components/BIcon";
import { Button } from "@/components/ui/button";
import BrandProfileRow from "./BrandProfileRow";

export default function BrandProfilesSection({ profiles, basePath, canManage }) {
  const { t } = useLanguage()
  return (
    <div className="p-5 sm:p-6 bg-white rounded-xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t("Brand Profiles")}</h2>
          <p className="text-sm text-gray-500 mt-1">{t("Customize how transfers, downloads, and emails appear to recipients.")}</p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href={`${basePath}/new`}>
              <BIcon name="plus-lg" />{t("New Brand Profile")}</Link>
          </Button>
        )}
      </div>

      {profiles.length > 0 ? (
        <ul className="mt-4 divide-y border rounded-lg overflow-hidden">
          {profiles.map(profile => (
            <li key={profile.id}>
              <BrandProfileRow
                name={profile.name}
                iconUrl={profile.iconUrl}
                backgroundUrl={profile.backgroundUrl}
                editHref={`${basePath}/${profile.id}`}
              />
            </li>
          ))}
        </ul>
      ) : (
        <></>
        // <p className="text-sm text-gray-600 mt-4">
        //   No brand profiles yet.
        // </p>
      )}
    </div>
  );
}
