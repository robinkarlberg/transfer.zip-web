
import { getTranslations } from "@/lib/server/language"
import GenericPage from "@/components/dashboard/GenericPage";
import EmptySpace from "@/components/elements/EmptySpace";
import { useServerAuth } from "@/lib/server/wrappers/auth";
import TeamEvent from "@/lib/server/mongoose/models/TeamEvent";
import { ACTIVITY_PAGE_SIZE } from "@/lib/activityFilters";
import ActivityClient from "./ActivityClient";

export async function generateMetadata() {
  const t = await getTranslations()
  return { title: t("Activity") }
}

export default async function TeamActivityPage() {
  const t = await getTranslations()
  const { user, team } = await useServerAuth();

  const rows = await TeamEvent.find({ team: team._id })
    .populate("actor", "email fullName")
    .sort({ createdAt: -1 })
    .limit(ACTIVITY_PAGE_SIZE + 1);

  const hasMore = rows.length > ACTIVITY_PAGE_SIZE;
  const events = (hasMore ? rows.slice(0, ACTIVITY_PAGE_SIZE) : rows).map(e => e.toJsonAsClient());

  if (events.length === 0) {
    return (
      <GenericPage title={t("Activity")}>
        <EmptySpace
          title={t("Keep Track of Every Team Action")}
          subtitle={t("Invites, role changes, member removals, and billing updates will show up here so you always know what's happening across your team.")}
        />
      </GenericPage>
    );
  }

  return (
    <ActivityClient
      initialEvents={events}
      initialHasMore={hasMore}
      currentUserId={user._id.toString()}
    />
  );
}
