"use client"

import { englishLandingText } from "@/lib/landing/en";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { HexagonIcon, PaintbrushIcon } from "lucide-react";
import Image from "next/image";
import { useId } from "react";

export default function ({ brandProfiles, brandProfileId, setBrandProfileId, disabled = false, text = englishLandingText.upload.brandProfile }) {
  const id = useId()

  const brandProfile = brandProfiles && brandProfiles.find(profile => profile.id === brandProfileId)

  return (
    <div className="flex items-center justify-between gap-4">
      <Label htmlFor={id}><PaintbrushIcon size={16} /> {text.brand}</Label>
      <Select value={brandProfileId || "none"} onValueChange={value => setBrandProfileId(value === "none" ? null : value)} disabled={disabled}>
        {/* min-w-0 lets a long name truncate instead of pushing the row wider than the panel */}
        <SelectTrigger id={id} size="sm" className="min-w-0">
          {
            brandProfile ?
              <>
                {brandProfile.iconUrl ?
                  <Image alt={text.icon} width={20} height={20} src={brandProfile.iconUrl} className="shrink-0" /> :
                  <HexagonIcon className="text-gray-400" />
                }
                <span className="truncate font-medium text-gray-700">{brandProfile.name}</span>
              </>
              :
              <span className="truncate text-gray-500">{text.none}</span>
          }
        </SelectTrigger>
        <SelectContent align={"end"}>
          {brandProfiles && brandProfiles.length > 0
            ?
            [brandProfiles.map(profile => (
              <SelectItem
                key={profile.id}
                value={profile.id}>
                {profile.iconUrl ?
                  <Image alt={text.icon} width={24} height={24} src={profile.iconUrl} /> :
                  <HexagonIcon className="w-[24px] h-[24px] p-0.5 rounded-lg border-2 border-dashed border-gray-400" />
                }
                <span className="text-sm font-medium text-gray-700">{profile.name}</span>
              </SelectItem>)
            ), <SelectItem key={"nonee"} value="none">{text.none}</SelectItem>]
            :
            <SelectItem key={"none"} value={"none"} disabled>{text.empty}</SelectItem>
          }
        </SelectContent>
      </Select>
    </div>
  )
}
