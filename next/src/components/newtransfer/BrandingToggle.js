"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectTriggerFix, SelectValue } from "@/components/ui/select";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useState } from "react";
import { PaintbrushIcon } from "lucide-react";
import Image from "next/image";

export default function ({ brandProfiles, brandProfileId, setBrandProfileId }) {

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
                  <Image alt="Brand Profile Icon" width={24} height={24} src={brandProfile.iconUrl} /> :
                  <HexagonIcon className="w-[24px] h-[24px] p-0.5 rounded-lg border-2 border-dashed border-gray-400" />
                }
                <span className="text-sm font-medium text-gray-700">{brandProfile.name}</span>
              </>
              :
              <>
                <span className="text-sm text-gray-700 flex items-center gap-2"><PaintbrushIcon className="text-gray-700" /> Brand</span>
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
                  <Image alt="Brand Profile Icon" width={24} height={24} src={profile.iconUrl} /> :
                  <HexagonIcon className="w-[24px] h-[24px] p-0.5 rounded-lg border-2 border-dashed border-gray-400" />
                }
                <span className="text-sm font-medium text-gray-700">{profile.name}</span>
              </SelectItem>)
            ), <SelectItem key={"nonee"} value={null}>No brand profile</SelectItem>]
            :
            <SelectItem key={"none"} value={"none"} disabled>No brand profiles.</SelectItem>
          }
        </SelectContent>
      </Select>
    </div>
  )
}