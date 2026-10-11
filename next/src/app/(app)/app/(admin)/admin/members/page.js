
import { getTranslations } from "@/lib/server/language"
import GenericPage from "@/components/dashboard/GenericPage";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import TeamInvite from "@/lib/server/mongoose/models/TeamInvite";
import Transfer from "@/lib/server/mongoose/models/Transfer";
import { ROLES } from "@/lib/roles";
import MembersSection from "../sections/MembersSection";
import AddUserButton from "../AddUserButton";

export async function generateMetadata() {
  const t = await getTranslations()
  return { title: t("Members") }
}

export default async function TeamMembersPage() {
  const t = await getTranslations()
  const { user, team } = await useServerAuth();

  await team.populate({ path: "users", populate: { path: "team" } });
  const invites = await TeamInvite.find({ team: team._id });

  // The Owner is the only role allowed to drill into other members'
  // transfers, so we only pay the aggregation cost for that role.
  let transferCounts = {};
  if (user.role === ROLES.OWNER) {
    const rows = await Transfer.aggregate([
      { $match: { team: team._id, expiresAt: { $gt: new Date() } } },
      { $group: { _id: "$author", count: { $sum: 1 } } },
    ]);
    transferCounts = Object.fromEntries(
      rows.filter(r => r._id).map(r => [r._id.toString(), r.count])
    );
  }

  const teamUsers = team.users.map(u => {
    const json = u.toJsonAsClient();
    return { ...json, activeTransferCount: transferCounts[json.id] || 0 };
  });

  const occupied = teamUsers.length + invites.length;
  const atCapacity = occupied >= team.seats;

  const side = (
    <div className="flex items-center gap-3">
      <span>
        {occupied}/{team.seats} {t("seats used")}{invites.length > 0 && ` (${invites.length} pending)`}
      </span>
      <AddUserButton atCapacity={atCapacity} />
    </div>
  );

  return (
    <GenericPage title={t("Members")} side={side}>
      <MembersSection
        currentUser={user.toJsonAsClient()}
        teamUsers={teamUsers}
        invites={invites.map(inv => inv.toJsonAsClient())}
      />
    </GenericPage>
  );
}
