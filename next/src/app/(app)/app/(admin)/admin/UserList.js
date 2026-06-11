"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteTeamInvite, deleteUser, sendTeamInvite, updateUserRole } from "@/lib/client/Api";
import { ROLES } from "@/lib/roles";
import { capitalizeFirstLetter } from "@/lib/utils";
import { ArrowRightIcon, EllipsisVerticalIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProfilePic from "@/components/ProfilePic";

function Entry({ user, currentUser, onDeleteUser, onUpdateRole }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const isOwner = user.role === ROLES.OWNER
  const isTargetAdmin = user.role === ROLES.ADMIN
  const currIsOwner = currentUser.role === ROLES.OWNER
  // Owner can manage any non-Owner. Admin can manage Members only -
  // they can't promote into / demote out of ADMIN (peer-role changes
  // are Owner-only). Mirrored on the server in
  // api/team/users/[userId]/route.js PUT.
  const canManageRoles = currIsOwner || (currentUser.role === ROLES.ADMIN && !isOwner && !isTargetAdmin)
  const canDeleteUsers = currentUser.role === ROLES.OWNER
  const isSelf = currentUser.id === user.id
  const showTransferCount = currIsOwner && user.activeTransferCount > 0

  return (
    <li className="flex items-center gap-4 p-3 bg-white rounded-lg border hover:bg-gray-50 transition">
      <ProfilePic name={user.fullName || user.email} />
      <div className="min-w-0 flex-1">
        {user.fullName ? (
          <>
            <div className="font-semibold text-gray-900 truncate">
              {user.fullName}
              {isSelf && <span className="text-gray-400 font-normal ml-2">(you)</span>}
            </div>
            <div className="text-sm text-gray-500 truncate">{user.email}</div>
          </>
        ) : (
          <div className="font-semibold text-gray-900 truncate">
            {user.email}
            {isSelf && <span className="text-gray-400 font-normal ml-2">(you)</span>}
          </div>
        )}
      </div>
      {showTransferCount && (
        <Link
          href={`/app/admin/transfers?author=${user.id}`}
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md px-2 py-1 transition whitespace-nowrap"
        >
          {user.activeTransferCount} {user.activeTransferCount === 1 ? "transfer" : "transfers"}
          <ArrowRightIcon size={12} />
        </Link>
      )}
      <div className={"text-xs font-medium px-2 py-0.5 rounded-full " + (user.role === ROLES.OWNER ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700")}>
        {capitalizeFirstLetter(user.role)}
      </div>
      <div className="relative">
        <DropdownMenu>
          {(canManageRoles && !isSelf) && <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><EllipsisVerticalIcon className="w-5 h-5 text-gray-600" /></Button>
          </DropdownMenuTrigger>}
          <DropdownMenuContent>
            {canManageRoles && !isOwner && !isSelf && (
              <DropdownMenuItem onClick={() => onUpdateRole(user)}>
                {user.role === ROLES.ADMIN ? "Demote to Member" : "Promote to Admin"}
              </DropdownMenuItem>
            )}
            {canDeleteUsers && !isOwner && (
              <DropdownMenuItem onClick={() => setShowDeleteModal(true)} className="text-destructive">
                Remove
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
          {showDeleteModal && (
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Remove User {user.email} </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this user? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </Button>
                  <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={() => {
                    onDeleteUser(user)
                    setShowDeleteModal(false)
                  }}>
                    Remove
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </DropdownMenu>
      </div>
    </li>
  )
}

function InviteEntry({ invite }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [resending, setResending] = useState(false)
  const router = useRouter()

  const handleDeleteInvite = async (_id) => {
    try {
      await deleteTeamInvite(_id)
      router.refresh()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleResendInvite = async () => {
    setResending(true)
    try {
      await sendTeamInvite(invite.email, invite.role)
      toast.success("Invite resent", { description: `A new invitation was sent to ${invite.email}` })
      router.refresh()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setResending(false)
    }
  }

  return (
    <li className="flex items-center gap-4 p-3 rounded-lg border border-dashed">
      <ProfilePic name={invite.email} />
      <div className="min-w-0">
        <div className="text-sm text-gray-600 truncate">{invite.email}</div>
      </div>
      <div className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
        Pending
      </div>
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><EllipsisVerticalIcon className="w-5 h-5 text-gray-600" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem disabled={resending} onClick={handleResendInvite}>
              {resending ? "Resending..." : "Resend invite"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowDeleteModal(true)} className="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
          {showDeleteModal && (
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Delete Invite to {invite.email} </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this invite? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </Button>
                  <Button type="button" className="bg-red-600 text-white hover:bg-red-700" onClick={() => {
                    handleDeleteInvite(invite.id)
                    setShowDeleteModal(false)
                  }}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </DropdownMenu>
      </div>
    </li>
  )
}

export default function UserList({ user, users, invites }) {
  const router = useRouter()

  const handleDeleteUser = async (targetUser) => {
    try {
      await deleteUser(targetUser.id)
      toast.success("User removed")
      router.refresh()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleUpdateRole = async (targetUser) => {
    const nextRole = targetUser.role === ROLES.ADMIN ? ROLES.MEMBER : ROLES.ADMIN
    try {
      await updateUserRole(targetUser.id, nextRole)
      toast.success("Role updated")
      router.refresh()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <ul className="space-y-2">
      {users.flat().map(listUser => (
        <Entry
          key={listUser.email}
          user={listUser}
          currentUser={user}
          onDeleteUser={handleDeleteUser}
          onUpdateRole={handleUpdateRole}
        />
      ))}
      {invites.map(invite => (
        <InviteEntry key={invite.email} invite={invite} />
      ))}
    </ul>
  )
}
