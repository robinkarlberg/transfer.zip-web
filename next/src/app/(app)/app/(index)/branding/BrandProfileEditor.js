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
import { SaveIcon } from "lucide-react"

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

  const side = <div className="flex gap-2 text-gray-800">
    <Button variant={"outline"} onClick={handleSave} disabled={loading}>
      <SaveIcon/>
      {saving && <Spinner />} Save
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
          <div className="flex justify-center border-b border-b-gray-200 p-4">
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
          <div
            className="px-4 pt-2 flex items-center justify-center h-[560px] relative"
          >
            {backgroundImageUrl ?
              (
                <Image
                  fill
                  alt="Branding Background Image"
                  className="object-center object-cover pointer-events-none"
                  src={backgroundImageUrl}
                />
              )
              : (
                <svg
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full stroke-gray-200 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]"
                >
                  <defs>
                    <pattern
                      x="50%"
                      y={-1}
                      id="83fd4e5a-9d52-42fc-97b6-718e5d7ee527"
                      width={200}
                      height={200}
                      patternUnits="userSpaceOnUse"
                    >
                      <path d="M100 200V.5M.5 .5H200" fill="none" />
                    </pattern>
                  </defs>
                  <svg x="50%" y={-1} className="overflow-visible fill-gray-50">
                    <path
                      d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z"
                      strokeWidth={0}
                    />
                  </svg>
                  <rect fill="url(#83fd4e5a-9d52-42fc-97b6-718e5d7ee527)" width="100%" height="100%" strokeWidth={0} />
                </svg>
              )}
            <div className="relative z-10 bg-white rounded-2xl border p-6 shadow-xl w-full max-w-80 min-h-96 flex flex-col justify-between">
              <div>
                <h2 className="font-bold text-xl/8 text-gray-800">Transfer Title</h2>
                <p className="text-gray-600">Transfer description</p>
                <hr className="my-2" />
                <span><i className="bi bi-file-earmark me-1"></i>42 Files</span>
                <p className="text-gray-600">123MB</p>
              </div>
              <div>
                <div className="mt-auto text-center">
                  <p className="text-gray-600 mb-1 text-sm">Expires in 6mo</p>
                </div>
                <div className="flex gap-2">
                  <button disabled type="button" className="text-gray-400 bg-white border shadow rounded-lg px-3 py-1 grow-0"><BIcon name={"search"} /> Preview</button>
                  <button disabled={true} className="text-white bg-primary shadow rounded-lg px-3 py-1 grow hover:bg-primary-light disabled:bg-primary-light">Download</button>
                </div>
              </div>
            </div>
            <div className="absolute w-full top-0 left-0 p-4 flex justify-center gap-2">
              <Button onClick={handleChooseBackground} variant={"outline"}>Choose Background</Button>
              {backgroundImageUrl != null && <Button className={"w-10"} variant={"outline"} onClick={() => setBackgroundImageUrl(null)}><BIcon name={"x-lg"} /></Button>}
            </div>
          </div>
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