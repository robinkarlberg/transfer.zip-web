import { UserIcon } from "lucide-react"

export default function ({  }) {
  return (
    <>
      <div className="flex items-center justify-center w-10 h-10 rounded-full object-cover">
        {/* {parseInitials(user.fullName)} */}
        <UserIcon/>
      </div>
    </>
  )
}