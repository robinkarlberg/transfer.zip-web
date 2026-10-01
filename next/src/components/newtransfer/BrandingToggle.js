"use client"

import { englishLandingText } from "@/lib/landing/en";
import { Select, SelectContent, SelectItem, SelectTriggerFix } from "@/components/ui/select";
import { HexagonIcon, PaintbrushIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function ({ brandProfiles, brandProfileId, setBrandProfileId, text = englishLandingText.upload.brandProfile }) {

  const [selecting, setSelecting] = useState(false)

  const handleCheckedChange = e => {
    setSelecting(true)
  }

  const brandProfile = brandProfiles && brandProfiles.find(profile => profile.id === brandProfileId)

  return (
    <div>
      <Select value={brandProfileId} onValueChange={setBrandProfileId}>
        <SelectTriggerFix size="sm">
          {
            brandProfile ?
              <>
                {brandProfile.iconUrl ?
                  <Image alt={text.icon} width={24} height={24} src={brandProfile.iconUrl} /> :
                  <HexagonIcon className="w-[24px] h-[24px] p-0.5 rounded-lg border-2 border-dashed border-gray-400" />
                }
                <span className="text-sm font-medium text-gray-700">{brandProfile.name}</span>
              </>
              :
              <>
                <span className="text-sm text-gray-700 flex items-center gap-2"><PaintbrushIcon className="text-gray-700" /> {text.brand}</span>
              </>
          }
        </SelectTriggerFix>
        <SelectContent align={"start"}>
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
            ), <SelectItem key={"nonee"} value={null}>{text.none}</SelectItem>]
            :
            <SelectItem key={"none"} value={"none"} disabled>{text.empty}</SelectItem>
          }
        </SelectContent>
      </Select>
    </div>
  )
}
