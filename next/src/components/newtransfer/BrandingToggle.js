"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectTriggerFix, SelectValue } from "@/components/ui/select";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useState } from "react";

export default function ({ brandProfiles, brandProfileId, setBrandProfileId }) {

  const [selecting, setSelecting] = useState(false)

  const handleCheckedChange = e => {
    setSelecting(true)
  }

  return (
    <div>
      <Select open={selecting} value={brandProfileId} onValueChange={setBrandProfileId}>
        <SelectTriggerFix as="div">
          <div className="flex items-center gap-2">
            <Switch onCheckedChange={handleCheckedChange} id="custom-branding" className={"peer"} />
            <Label className={`text-gray-500 peer-data-[state=checked]:text-gray-800`} htmlFor="custom-brandinge">
              Custom Branding
            </Label>
          </div>
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