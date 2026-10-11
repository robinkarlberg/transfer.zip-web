
"use client"
import { useLanguage } from "@/context/LanguageContext"
import { UserPlusIcon } from "lucide-react";
import UserList from "../UserList";
import AdminCard from "../AdminCard";

export default function MembersSection({ currentUser, teamUsers, invites }) {
  const { t, landingText } = useLanguage()
  const aloneOnTeam = teamUsers.length === 1 && invites.length === 0;

  return (
    <AdminCard>
      <UserList user={currentUser} users={teamUsers} invites={invites} />

      {aloneOnTeam && (
        <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-6 text-center">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700 mb-2">
            <UserPlusIcon size={18} />
          </div>
          <div className="font-medium text-gray-900">{t("You're the only one here")}</div>
          <p className="text-sm text-gray-500 mt-1">{t("Invite teammates by email so everyone can share branding and use the team's storage.")}</p>
        </div>
      )}
    </AdminCard>
  );
}
