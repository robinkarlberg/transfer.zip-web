import GenericPage from "@/components/dashboard/GenericPage";
import { ROLES } from "@/lib/roles";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import { redirect } from "next/navigation";
import TeamPage from "./TeamPage";
import UserList from "./UserList";
import TeamInvite from "@/lib/server/mongoose/models/TeamInvite";

export default async function () {
  const auth = await useServerAuth()
  const { user, team } = auth

  if (!user.hasTeam || user.role == ROLES.MEMBER) {
    redirect("/app")
  }

  await team.populate("users")

  const invites = await TeamInvite.find({ team: team._id })

  const teamUsers = team.users.map(u => ({
    id: u._id.toString(),
    email: u.email,
    fullName: u.email.split("@")[0],
    roles: [u.role]
  }))

  const currentUser = {
    id: user._id.toString(),
    roles: [user.role]
  }

  const storage = await user.getStorage()

  return (
    <GenericPage title={"Team"}>
      <div className="p-5 sm:p-6 bg-white rounded-xl mb-4">
        <div className="sm:col-span-full">
          <UserList
            users={teamUsers}
            user={currentUser}
            maxUsers={team.seats}
            invites={invites.map(inv => inv.friendlyObj())}
          />
        </div>
        
      </div>
      <TeamPage user={user.friendlyObj()} storage={storage} team={team.friendlyObj()}/>
    </GenericPage>
  )
}