"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDownToLineIcon,
  EyeIcon,
  Trash2Icon,
  CopyIcon,
  EllipsisVerticalIcon,
  CalendarPlusIcon,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteTeamTransfer, extendTeamTransfer } from "@/lib/client/Api";
import { humanFileSize } from "@/lib/transferUtils";
import { humanTimeUntil, tryCopyToClipboard } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import ProfilePic from "@/components/ProfilePic";
import GenericPage from "@/components/dashboard/GenericPage";
import EmptySpace from "@/components/elements/EmptySpace";
import AdminCard from "../AdminCard";

const QUICK_EXTENSIONS = [
  { label: "+ 7 days", days: 7 },
  { label: "+ 30 days", days: 30 },
  { label: "+ 90 days", days: 90 },
];

function clampExtension(transfer, addDays, maxExpiryDays) {
  // Add `addDays` to whichever is later: now, or the current expiry. Pinning
  // to the current expiry is what makes the +7d / +30d clicks feel cumulative.
  const base = transfer.expiresAt
    ? new Date(Math.max(new Date(transfer.expiresAt).getTime(), Date.now()))
    : new Date();
  const candidate = new Date(base);
  candidate.setDate(candidate.getDate() + addDays);

  const ceiling = new Date(transfer.createdAt);
  ceiling.setDate(ceiling.getDate() + maxExpiryDays);
  return candidate > ceiling ? ceiling : candidate;
}

function Row({ transfer, canManage, onDelete, onExtend, maxExpiryDays }) {
  const author = transfer.author;
  const expiresAt = transfer.expiresAt ? new Date(transfer.expiresAt) : null;
  const expired = expiresAt && expiresAt <= new Date();

  const handleCopy = async () => {
    if (await tryCopyToClipboard(transfer.downloadUrl)) {
      toast.success("Copied link");
    }
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition">
      <div className="col-span-12 sm:col-span-5 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{transfer.name}</div>
        <div className="text-xs text-gray-500 mt-0.5">
          {transfer.files.length} file{transfer.files.length === 1 ? "" : "s"} · {humanFileSize(transfer.size, true)}
        </div>
      </div>

      <div className="col-span-6 sm:col-span-3 flex items-center gap-2 min-w-0">
        {author ? (
          <>
            <ProfilePic name={author.fullName || author.email} size={20} />
            <div className="text-sm text-gray-700 truncate">
              {author.fullName || author.email.split("@")[0]}
            </div>
          </>
        ) : (
          <div className="text-xs text-gray-500">Unknown</div>
        )}
      </div>

      <div className="col-span-3 sm:col-span-2 flex items-center gap-3 text-xs text-gray-600 tabular-nums">
        <span className="inline-flex items-center gap-1">
          <ArrowDownToLineIcon size={12} />
          {transfer.statistics.downloads.length}
        </span>
        <span className="inline-flex items-center gap-1">
          <EyeIcon size={12} />
          {transfer.statistics.views.length}
        </span>
      </div>

      <div className="col-span-2 sm:col-span-1 text-xs text-gray-600">
        {expired ? (
          <span className="text-amber-600">Expired</span>
        ) : expiresAt ? (
          `${humanTimeUntil(expiresAt)} left`
        ) : (
          "-"
        )}
      </div>

      <div className="col-span-1 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Actions">
              <EllipsisVerticalIcon className="w-4 h-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopy}>
              <CopyIcon size={14} /> Copy link
            </DropdownMenuItem>
            {canManage && (
              <>
                <DropdownMenuItem onClick={() => onExtend(transfer)}>
                  <CalendarPlusIcon size={14} /> Extend expiry
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(transfer)}>
                  <Trash2Icon size={14} /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ExtendDialog({ transfer, maxExpiryDays, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!transfer) return null;

  const ceiling = new Date(transfer.createdAt);
  ceiling.setDate(ceiling.getDate() + maxExpiryDays);
  const ceilingISO = ceiling.toISOString().slice(0, 10);
  const currentExpiry = transfer.expiresAt ? new Date(transfer.expiresAt) : null;

  const applyExpiry = async (newDate) => {
    setSaving(true);
    setError("");
    try {
      await extendTeamTransfer(transfer.id, newDate.toISOString());
      toast.success("Expiry extended");
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickExtend = (days) => {
    const next = clampExtension(transfer, days, maxExpiryDays);
    if (next <= new Date()) {
      setError(`Maximum expiry is ${maxExpiryDays} days from creation`);
      return;
    }
    return applyExpiry(next);
  };

  const handleSetToMax = () => {
    if (ceiling <= new Date()) {
      setError(`Maximum expiry (${ceilingISO}) has already passed for this transfer`);
      return;
    }
    return applyExpiry(ceiling);
  };

  const handleCustom = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get("expiresAt");
    if (!value) return;
    const date = new Date(`${value}T23:59:59`);
    if (Number.isNaN(date.getTime())) {
      setError("Invalid date");
      return;
    }
    if (date <= new Date()) {
      setError("Date must be in the future");
      return;
    }
    if (date > ceiling) {
      setError(`Date cannot be later than ${ceilingISO}`);
      return;
    }
    await applyExpiry(date);
  };

  return (
    <Dialog open={!!transfer} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Extend expiry</DialogTitle>
          <DialogDescription>
            "{transfer.name}" currently {currentExpiry
              ? `expires ${currentExpiry.toLocaleDateString()}`
              : "has no expiry"
            }. Maximum allowed by plan: {ceilingISO}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="flex flex-wrap gap-2">
            {QUICK_EXTENSIONS.map(({ label, days }) => (
              <Button
                key={days}
                variant="outline"
                size="sm"
                disabled={saving}
                onClick={() => handleQuickExtend(days)}
              >
                {label}
              </Button>
            ))}
            <Button variant="outline" size="sm" disabled={saving} onClick={handleSetToMax}>
              Set to max
            </Button>
          </div>
          <form onSubmit={handleCustom} className="flex items-end gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-500" htmlFor="expiresAt">Custom date</label>
              <Input
                id="expiresAt"
                name="expiresAt"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                max={ceilingISO}
                defaultValue={currentExpiry ? currentExpiry.toISOString().slice(0, 10) : ceilingISO}
                disabled={saving}
              />
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? <><Loader2 className="animate-spin" size={16} /> Saving...</> : "Set date"}
            </Button>
          </form>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={saving}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TransfersSection({ transfers, role, maxExpiryDays }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAuthor = searchParams.get("author") || "all";
  const [query, setQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState(initialAuthor);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [extendTarget, setExtendTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const canManage = role === ROLES.OWNER;

  const authors = useMemo(() => {
    const seen = new Map();
    transfers.forEach(t => {
      if (t.author && !seen.has(t.author.id)) {
        seen.set(t.author.id, t.author);
      }
    });
    return Array.from(seen.values());
  }, [transfers]);

  const filtered = useMemo(() => {
    return transfers.filter(t => {
      if (authorFilter !== "all" && t.author?.id !== authorFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${t.name} ${t.author?.email || ""} ${t.author?.fullName || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [transfers, query, authorFilter]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTeamTransfer(deleteTarget.id);
      toast.success("Transfer deleted");
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const hasTransfers = transfers.length > 0;

  const side = hasTransfers ? (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="text-white whitespace-nowrap">
        {filtered.length} of {transfers.length}
      </div>
      <Input
        variant="white"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search any..."
        className="w-44"
      />
      <Select value={authorFilter} onValueChange={setAuthorFilter}>
        <SelectTrigger variant="white" className="w-48">
          <SelectValue placeholder="All members" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All members</SelectItem>
          {authors.map(a => (
            <SelectItem key={a.id} value={a.id}>
              {a.fullName || a.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  ) : null;

  return (
    <GenericPage title="Transfers" side={side}>
      <div className="space-y-3">
        {!hasTransfers ? (
          <EmptySpace
            title="See Every Transfer Your Team Sends"
            subtitle="Once members start sharing files, you'll see every transfer here with downloads, views, and the option to extend or remove them."
          />
        ) : (
          <AdminCard>
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                No transfers match your filters.
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-xs uppercase tracking-wider text-gray-500 bg-gray-50 border-b">
                  <div className="col-span-5">Transfer</div>
                  <div className="col-span-3">Uploaded by</div>
                  <div className="col-span-2">Activity</div>
                  <div className="col-span-1">Expires</div>
                  <div className="col-span-1" />
                </div>
                {filtered.map(t => (
                  <Row
                    key={t.id}
                    transfer={t}
                    canManage={canManage}
                    onDelete={setDeleteTarget}
                    onExtend={setExtendTarget}
                    maxExpiryDays={maxExpiryDays}
                  />
                ))}
              </div>
            )}
          </AdminCard>
        )}

        {!canManage && hasTransfers && (
          <p className="text-xs text-white px-1">
            Only the Owner can modify or delete other members' transfers.
          </p>
        )}

        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete transfer</DialogTitle>
              <DialogDescription>
                {deleteTarget ? `"${deleteTarget.name}" by ${deleteTarget.author?.email || "unknown member"} will be permanently deleted.` : ""}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
              <Button
                className="bg-red-600 text-white hover:bg-red-700"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting" : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ExtendDialog
          transfer={extendTarget}
          maxExpiryDays={maxExpiryDays}
          onClose={() => setExtendTarget(null)}
          onSaved={() => {
            setExtendTarget(null);
            router.refresh();
          }}
        />
      </div>
    </GenericPage>
  );
}
