"use client"

import BIcon from "@/components/BIcon"
import GenericPage from "@/components/dashboard/GenericPage"
import { YesNo } from "@/components/dashboard/YesNo"
import FileUpload from "@/components/elements/FileUpload"
import Spinner from "@/components/elements/Spinner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { sleep } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { useRef, useState } from "react"
import { deleteBrandProfile, newBrandProfile, updateBrandProfile } from "@/lib/client/Api"
import { useRouter } from "next/navigation"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ImageIcon, SaveIcon, XIcon } from "lucide-react"

export default function ({ initialProfile, isNew }) {
  const [profile, setProfile] = useState(initialProfile)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const loading = saving || deleting
  const router = useRouter()

  const backgroundFileInputRef = useRef(null)
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(initialProfile.backgroundUrl || null)

  const iconFileInputRef = useRef(null)
  const [iconImageUrl, setIconImageUrl] = useState(initialProfile.iconUrl || null)

  const handleSave = async e => {
    setSaving(true)
    const payload = {
      name: profile.name,
      iconUrl: iconImageUrl,
      backgroundUrl: backgroundImageUrl,
    }
    try {
      if (isNew) {
        const { brandProfile } = await newBrandProfile(payload)
        window.location.replace(`/app/branding`)
      } else {
        await updateBrandProfile(initialProfile.id, payload)
        window.location.replace(`/app/branding`)
      }
    }
    catch {
      setSaving(false)
    }
  }

  const [editingName, setEditingName] = useState(false)
  const nameRef = useRef()
  const handleSetName = () => {
    setProfile({ ...profile, name: nameRef.current.value })
    setEditingName(false)
  }

  const handleChooseBackground = e => {
    backgroundFileInputRef.current.click()
  }

  const handleChooseIcon = e => {
    iconFileInputRef.current.click()
  }

  const handleImageFiles = (setImageUrl, profileKey) => async e => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImageUrl(reader.result)
      // setProfile({ ...profile, [profileKey]: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const handleBackgroundFiles = handleImageFiles(setBackgroundImageUrl, "backgroundUrl")
  const handleLogoFiles = handleImageFiles(setIconImageUrl, "iconUrl")

  const handleDelete = async () => {
    setDeleting(true)
    await deleteBrandProfile(profile.id)
    window.location.replace("/app/branding")
  }

  const side = <div className="flex gap-2">
    <Button className={"text-white text-shadow-xs"} variant={"link"} onClick={() => router.push(".")} disabled={loading}>
      Cancel
    </Button>
    <Button variant={"white"} onClick={handleSave} disabled={loading}>
      {/* <SaveIcon /> */}
      Save
      {saving && <Spinner />}
    </Button>
  </div>

  return (
    <>
      <form className="hidden">
        <input onChange={handleLogoFiles} ref={iconFileInputRef} type="file" />
      </form>
      <form className="hidden">
        <input onChange={handleBackgroundFiles} ref={backgroundFileInputRef} type="file" />
      </form>
      <GenericPage category={"Branding"} title={isNew ? "New Brand Profile" : profile.name} side={side}>
        <div className="p-5 sm:p-6 bg-white rounded-xl">
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="sm:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 ">Icon & Brand name</h2>
              <p className="mt-1 text-gray-600 text-sm/6">Choose an icon and a name for your brand. Could be your company logo and name.</p>
              <div className="mt-4">
                <span className="-m-1.5 p-1.5 flex items-center gap-x-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={handleChooseIcon}>
                        {iconImageUrl ?
                          <Image
                            alt="Brand Profile Logo"
                            width={32}
                            height={32}
                            src={iconImageUrl}
                          />
                          :
                          <div className="w-8 h-8 border border-dashed rounded-md border-gray-300 text-gray-400">
                            <BIcon className={"w-8 h-8"} name={"plus-circle-dotted"} center />
                          </div>
                        }
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side={"bottom"}>
                      Click to change icon
                    </TooltipContent>
                  </Tooltip>
                  {
                    editingName ?
                      <div className="flex gap-2">
                        <Input
                          placeholder="Your Company Name"
                          className="h-8 w-40"
                          ref={nameRef}
                          defaultValue={profile.name}
                          onKeyDown={e => {
                            if (e.key === "Enter") {
                              handleSetName()
                            }
                          }}
                        />
                        <YesNo onYes={handleSetName} onNo={() => setEditingName(false)} />
                      </div>
                      :
                      <div>
                        <Tooltip>
                          <TooltipTrigger onClick={() => setEditingName(true)}>
                            {/* <button> */}
                            <span className='ms-0.5 font-bold'>{profile.name || "Your Company Name"}</span>
                            {/* </button> */}
                          </TooltipTrigger>
                          <TooltipContent side={"bottom"}>
                            Click to change company name
                          </TooltipContent>
                        </Tooltip>
                      </div>
                  }
                </span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 ">Background Image</h2>
              <p className="mt-1 text-gray-600 text-sm/6">The background image will be displayed on your download/upload pages.</p>
              <div className="mt-4 w-full">
                <button onClick={handleChooseBackground} className="relative w-96 h-60 block">
                  {backgroundImageUrl ?
                    (
                      <Image
                        fill
                        alt="Branding Background Image"
                        className="rounded-md object-cover"
                        src={backgroundImageUrl}
                      />
                    )
                    : (
                      <div className="w-full flex flex-col gap-2 items-center justify-center bg-gray-50 text-gray-600 h-60 transition-colors hover:bg-gray-100">
                        <ImageIcon />
                        <span>Pick image</span>
                      </div>
                    )}
                </button>
                {backgroundImageUrl != null && <Button size={"sm"} variant={"ghost"} className={"text-gray-700 mt-2"} onClick={() => setBackgroundImageUrl(null)}>Remove background</Button>}
              </div>
            </div>
          </div>
          {/* <div
            className="px-4 pt-2 flex items-center justify-center h-[560px] relative"
          >
            <div className="absolute w-full top-0 left-0 p-4 flex justify-center gap-2">
              <Button onClick={handleChooseBackground} variant={"outline"}>Choose Background</Button>
              {backgroundImageUrl != null && <Button className={"w-10"} variant={"outline"} onClick={() => setBackgroundImageUrl(null)}><BIcon name={"x-lg"} /></Button>}
            </div>
          </div> */}
        </div>
        <div className="mt-4 flex flex-row-reverse">
          <Dialog>
            <DialogTrigger asChild>
              <Button className={"text-white text-shadow-xs"} variant="link" disabled={loading}>
                {deleting && <Spinner />} Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Brand Profile</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this brand profile? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  disabled={loading}
                  onClick={handleDelete}
                >
                  {deleting && <Spinner />} Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </GenericPage >
    </>
  )
}