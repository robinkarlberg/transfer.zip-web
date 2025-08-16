"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"
import SignInWithGoogleButton from "./SignInWithGoogleButton"
import { Button } from "./ui/button"
import { Input } from "./ui/input"

export default function ({ open, setOpen, filename }) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showCloseButton={false} className={"w-sm"}>
        <DialogHeader>
          <DialogTitle className={"text-center text-2xl"}>Extend your link's life!</DialogTitle>
          {/* <DialogDescription>
            
          </DialogDescription> */}
        </DialogHeader>
        <div>
          <p className="text-gray-600 mb-4 text-center">
            Keep <span className="font-mono bg-gray-50 px-0.5 text-gray-800">{filename}</span> available for up to a year.
          </p>
          <SignInWithGoogleButton />
          <div className="relative">
            <hr className="absolute top-0 mt-2.5 w-full"/>
            <p className="relative z-10 text-center text-gray-600 my-2 text-sm"><span className="bg-white px-3">OR</span></p>
          </div>
          <Input
            name="email"
            type="email"
            placeholder="name@example.com"
          ></Input>
          <Button className={"mt-2 w-full"}>Sign In with Email</Button>
        </div>
        {/* <DialogFooter className={"sm:justify-start"}>
          <Button onClick={() => {
            window.location.href = `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}?subject=Downgrade%20Subscription`
          }}>Contact Us</Button>
          <DialogClose asChild>
            <Button variant={"outline"}>Cancel</Button>
          </DialogClose>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  )
}