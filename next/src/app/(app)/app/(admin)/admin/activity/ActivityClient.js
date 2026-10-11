"use client";
import { useLanguage } from "@/context/LanguageContext"

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import GenericPage from "@/components/dashboard/GenericPage";
import { Button } from "@/components/ui/button";
import { getTeamEvents } from "@/lib/client/Api";
import { ACTIVITY_FILTERS } from "@/lib/activityFilters";
import AdminCard from "../AdminCard";
import ActivityFeed from "../sections/ActivityFeed";

function dayKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(iso, t, locale) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(iso);
  date.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today - date) / 86400000);
  if (diffDays === 0) return t("Today");
  if (diffDays === 1) return t("Yesterday");
  if (diffDays < 7) return date.toLocaleDateString(locale, { weekday: "long" });
  const sameYear = today.getFullYear() === date.getFullYear();
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  });
}

function groupByDay(events, t, locale) {
  const groups = [];
  let current = null;
  for (const ev of events) {
    const key = dayKey(ev.createdAt);
    if (!current || current.key !== key) {
      current = { key, label: dayLabel(ev.createdAt, t, locale), events: [] };
      groups.push(current);
    }
    current.events.push(ev);
  }
  return groups;
}

function FilterChips({ active, onChange, disabled }) {
  const { t } = useLanguage()
  return (
    <div className="flex flex-wrap gap-1.5">
      {ACTIVITY_FILTERS.map(f => {
        const isActive = active === f.key;
        return (
          <Button
            key={f.key}
            type="button"
            variant="white"
            onClick={() => onChange(f.key)}
            disabled={disabled}
            className={isActive ? "" : "bg-primary-800 text-white hover:bg-primary-900"}
          >
            {t(f.label)}
          </Button>
        );
      })}
    </div>
  );
}

export default function ActivityClient({ initialEvents, initialHasMore, currentUserId }) {
  const { t, locale } = useLanguage()
  const [events, setEvents] = useState(initialEvents);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [filter, setFilter] = useState("all");
  const [filterLoading, setFilterLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const groups = useMemo(() => groupByDay(events, t, locale), [events, t, locale]);

  const changeFilter = async (next) => {
    if (next === filter || filterLoading) return;
    setFilter(next);
    setFilterLoading(true);
    try {
      const res = await getTeamEvents({ filter: next });
      setEvents(res.events);
      setHasMore(res.hasMore);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFilterLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore || filterLoading) return;
    const last = events[events.length - 1];
    setLoadingMore(true);
    try {
      const res = await getTeamEvents({ filter, before: last.createdAt });
      setEvents(prev => [...prev, ...res.events]);
      setHasMore(res.hasMore);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const busy = filterLoading || loadingMore;

  return (
    <GenericPage
      title={t("Activity")}
      side={<FilterChips active={filter} onChange={changeFilter} disabled={busy} />}
    >
      <AdminCard>
        {filterLoading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="animate-spin text-gray-400" size={20} />
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-500">{t("No events match this filter.")}</div>
        ) : (
          <div className="flex flex-col gap-5">
            {groups.map(group => (
              <div key={group.key}>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 px-2">
                  {group.label}
                </div>
                <ActivityFeed events={group.events} currentUserId={currentUserId} />
              </div>
            ))}
            {hasMore && (
              <div className="pt-2 flex justify-center">
                <Button variant="outline" size="sm" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />{t("Loading")}</>
                  ) : (
                    t("Load more")
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </AdminCard>
    </GenericPage>
  );
}
