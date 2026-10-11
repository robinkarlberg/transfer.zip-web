"use client"
import { useLanguage } from "@/context/LanguageContext"
import {
  UserPlusIcon,
  UserMinusIcon,
  UserCheckIcon,
  MailIcon,
  MailXIcon,
  ShieldIcon,
  SendIcon,
  Trash2Icon,
  CreditCardIcon,
  AlertTriangleIcon,
  PencilIcon,
  LinkIcon,
  Link2OffIcon,
} from "lucide-react";

// Each entry returns the verb-phrase form ("invited foo@example.com"). The
// renderer prepends the actor name (or "You" when the viewer is the actor),
// giving "Bob Smith invited foo@example.com". Events with no actor (Stripe
// webhook for seat downgrades, etc.) fall back to a capitalized impersonal
// form: "Reduced seats from 5 to 3".
const getTypes = t => ({
  invite_sent: {
    icon: MailIcon,
    verb: (e) => t("invited {0}{1}", { "0": e.data.email, "1": e.data.resent ? t(" again") : "" }),
  },
  invite_revoked: {
  icon: MailXIcon,
    verb: (e) => t("revoked the invite to {0}", { "0": e.data.email }),
  },
  invite_accepted: {
    icon: UserCheckIcon,
    verb: () => t("joined the team"),
  },
  member_removed: {
    icon: UserMinusIcon,
    verb: (e) => {
      const base = t("removed {0}", { "0": e.data.email || t("a member") });
      const n = e.data.transfersReassigned || 0;
      return n > 0
        ? t("{action} ({count} {transfers} reassigned)", { action: base, count: n, transfers: n === 1 ? t("transfer") : t("transfers") })
        : base;
    },
  },
  role_changed: {
    icon: ShieldIcon,
    verb: (e) => t("changed {0}'s role from {1} to {2}", { "0": e.data.email, "1": t(e.data.from), "2": t(e.data.to) }),
  },
  seat_purchased: {
    icon: CreditCardIcon,
    verb: (e) => {
      const n = e.data.count || 1;
      const seat = n === 1 ? t("seat") : t("seats");
      return t("added {0} {1}{2}", { "0": n, "1": seat, "2": e.data.email ? t(" for {email}", { email: e.data.email }) : "" });
    },
  },
  seat_reduced: {
    icon: AlertTriangleIcon,
    verb: (e) => t("reduced seats from {0} to {1}{2}", { "0": e.data.from, "1": e.data.to, "2": e.data.overCapacity ? t(" (team is over capacity)") : "" }),
  },
  team_renamed: {
    icon: PencilIcon,
    verb: (e) => e.data.from
      ? t("renamed the team from \"{0}\" to \"{1}\"", { "0": e.data.from, "1": e.data.to })
      : t("renamed the team to \"{0}\"", { "0": e.data.to }),
  },
  transfer_created: {
    icon: SendIcon,
    verb: (e) => t("created transfer \"{0}\"", { "0": e.data.transferName || t("Untitled") }),
  },
  transfer_deleted: {
    icon: Trash2Icon,
    verb: (e) => t("deleted transfer \"{0}\"{1}", { "0": e.data.transferName || t("Untitled"), "1": e.data.byAdmin ? t(" (admin)") : "" }),
  },
  transfer_request_activated: {
    icon: LinkIcon,
    verb: (e) => t("reactivated request link \"{0}\"{1}", { "0": e.data.transferRequestName || t("Untitled"), "1": e.data.byAdmin ? t(" (admin)") : "" }),
  },
  transfer_request_deactivated: {
    icon: Link2OffIcon,
    verb: (e) => t("deactivated request link \"{0}\"{1}", { "0": e.data.transferRequestName || t("Untitled"), "1": e.data.byAdmin ? t(" (admin)") : "" }),
  },
  transfer_request_deleted: {
    icon: Trash2Icon,
    verb: (e) => {
      const n = e.data.deletedTransfersCount || 0;
      const suffix = e.data.byAdmin ? t(" (admin)") : "";
      const base = t("deleted request link \"{0}\"", { "0": e.data.transferRequestName || t("Untitled") });
      return n > 0
        ? t("{action} and {count} received {transfers}{suffix}", { action: base, count: n, transfers: n === 1 ? t("transfer") : t("transfers"), suffix })
        : `${base}${suffix}`;
    },
  },
});

const DEFAULT_ENTRY = {
  icon: UserPlusIcon,
  verb: (e) => e.type,
};

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function actorLabel(actor, currentUserId, t) {
  if (!actor) return null;
  if (currentUserId && actor.id === currentUserId) return t("You");
  return actor.fullName || actor.email;
}

function timeAgo(iso, t) {
  const seconds = Math.floor((new Date() - new Date(iso)) / 1000);
  if (seconds < 60) return t("Just now");
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t("{0}m ago", { "0": minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("{0}h ago", { "0": hours });
  const days = Math.floor(hours / 24);
  if (days < 30) return t("{0}d ago", { "0": days });
  const months = Math.floor(days / 30);
  return t("{0}mo ago", { "0": months });
}

export default function ActivityFeed({ events, currentUserId }) {
  const { t } = useLanguage()
  const TYPES = getTypes(t)
  return (
    <ul className="flex flex-col divide-y gap-1">
      {events.map(event => {
        const meta = TYPES[event.type] || DEFAULT_ENTRY;
        const Icon = meta.icon;
        const verb = meta.verb(event);
        const actor = actorLabel(event.actor, currentUserId, t);
        const line = actor ? `${actor} ${verb}` : capitalize(verb);
        return (
          <li key={event.id} className="flex items-start gap-2 p-2">
            <Icon size={16} className="text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-800">{line}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {timeAgo(event.createdAt, t)}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
