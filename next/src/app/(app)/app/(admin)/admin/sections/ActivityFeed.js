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
const TYPES = {
  invite_sent: {
    icon: MailIcon,
    verb: (e) => `invited ${e.data.email}${e.data.resent ? " again" : ""}`,
  },
  invite_revoked: {
  icon: MailXIcon,
    verb: (e) => `revoked the invite to ${e.data.email}`,
  },
  invite_accepted: {
    icon: UserCheckIcon,
    verb: () => `joined the team`,
  },
  member_removed: {
    icon: UserMinusIcon,
    verb: (e) => {
      const base = `removed ${e.data.email || "a member"}`;
      const n = e.data.transfersReassigned || 0;
      return n > 0
        ? `${base} (${n} ${n === 1 ? "transfer" : "transfers"} reassigned)`
        : base;
    },
  },
  role_changed: {
    icon: ShieldIcon,
    verb: (e) => `changed ${e.data.email}'s role from ${e.data.from} to ${e.data.to}`,
  },
  seat_purchased: {
    icon: CreditCardIcon,
    verb: (e) => {
      const n = e.data.count || 1;
      const seat = n === 1 ? "seat" : "seats";
      return `added ${n} ${seat}${e.data.email ? ` for ${e.data.email}` : ""}`;
    },
  },
  seat_reduced: {
    icon: AlertTriangleIcon,
    verb: (e) => `reduced seats from ${e.data.from} to ${e.data.to}${e.data.overCapacity ? " (team is over capacity)" : ""}`,
  },
  team_renamed: {
    icon: PencilIcon,
    verb: (e) => e.data.from
      ? `renamed the team from "${e.data.from}" to "${e.data.to}"`
      : `renamed the team to "${e.data.to}"`,
  },
  transfer_created: {
    icon: SendIcon,
    verb: (e) => `created transfer "${e.data.transferName || "Untitled"}"`,
  },
  transfer_deleted: {
    icon: Trash2Icon,
    verb: (e) => `deleted transfer "${e.data.transferName || "Untitled"}"${e.data.byAdmin ? " (admin)" : ""}`,
  },
  transfer_request_activated: {
    icon: LinkIcon,
    verb: (e) => `reactivated request link "${e.data.transferRequestName || "Untitled"}"${e.data.byAdmin ? " (admin)" : ""}`,
  },
  transfer_request_deactivated: {
    icon: Link2OffIcon,
    verb: (e) => `deactivated request link "${e.data.transferRequestName || "Untitled"}"${e.data.byAdmin ? " (admin)" : ""}`,
  },
  transfer_request_deleted: {
    icon: Trash2Icon,
    verb: (e) => {
      const n = e.data.deletedTransfersCount || 0;
      const suffix = e.data.byAdmin ? " (admin)" : "";
      const base = `deleted request link "${e.data.transferRequestName || "Untitled"}"`;
      return n > 0
        ? `${base} and ${n} received transfer${n === 1 ? "" : "s"}${suffix}`
        : `${base}${suffix}`;
    },
  },
};

const DEFAULT_ENTRY = {
  icon: UserPlusIcon,
  verb: (e) => e.type,
};

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function actorLabel(actor, currentUserId) {
  if (!actor) return null;
  if (currentUserId && actor.id === currentUserId) return "You";
  return actor.fullName || actor.email;
}

function timeAgo(iso) {
  const seconds = Math.floor((new Date() - new Date(iso)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function ActivityFeed({ events, currentUserId }) {
  return (
    <ul className="flex flex-col divide-y gap-1">
      {events.map(event => {
        const meta = TYPES[event.type] || DEFAULT_ENTRY;
        const Icon = meta.icon;
        const verb = meta.verb(event);
        const actor = actorLabel(event.actor, currentUserId);
        const line = actor ? `${actor} ${verb}` : capitalize(verb);
        return (
          <li key={event.id} className="flex items-start gap-2 p-2">
            <Icon size={16} className="text-gray-400 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-800">{line}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                {timeAgo(event.createdAt)}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
