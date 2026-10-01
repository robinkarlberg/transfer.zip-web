"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDownToLineIcon,
  Trash2Icon,
  CopyIcon,
  EllipsisVerticalIcon,
  LinkIcon,
  Link2OffIcon,
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
import {
  activateTeamTransferRequest,
  deactivateTeamTransferRequest,
  deleteTeamTransferRequest,
} from "@/lib/client/Api";
import { tryCopyToClipboard } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import ProfilePic from "@/components/ProfilePic";
import GenericPage from "@/components/dashboard/GenericPage";
import EmptySpace from "@/components/elements/EmptySpace";
import AdminCard from "../AdminCard";

function Row({ request, canManage, busy, onCopy, onToggleActive, onDelete }) {
  const author = request.author;
  const handleCopy = async () => {
    if (await tryCopyToClipboard(request.uploadUrl)) {
      toast.success("Copied link");
    }
    onCopy?.(request);
  };

  return (
    <div className="grid grid-cols-12 gap-3 items-center px-4 py-3 border-b last:border-b-0 hover:bg-gray-50 transition">
      <div className="col-span-12 sm:col-span-5 min-w-0 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${request.active ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"}`}>
          {request.active ? <LinkIcon size={16} /> : <Link2OffIcon size={16} />}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">{request.name}</div>
          <div className="text-xs text-gray-500 mt-0.5 truncate">
            {request.active ? "Active link" : "Inactive"}
          </div>
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
          {request.receivedTransfersCount}
        </span>
      </div>

      <div className="col-span-2 sm:col-span-1 text-xs text-gray-600">
        {request.active ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">Active</span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Inactive</span>
        )}
      </div>

      <div className="col-span-1 flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Actions" disabled={busy}>
              <EllipsisVerticalIcon className="w-4 h-4 text-gray-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleCopy}>
              <CopyIcon size={14} /> Copy link
            </DropdownMenuItem>
            {canManage && (
              <>
                <DropdownMenuItem onClick={() => onToggleActive(request)}>
                  {request.active ? <Link2OffIcon size={14} /> : <LinkIcon size={14} />}
                  {request.active ? "Deactivate link" : "Reactivate link"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => onDelete(request)}>
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

export default function RequestsSection({ requests, role }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAuthor = searchParams.get("author") || "all";
  const [query, setQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState(initialAuthor);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const canManage = role === ROLES.OWNER;

  const authors = useMemo(() => {
    const seen = new Map();
    requests.forEach(r => {
      if (r.author && !seen.has(r.author.id)) {
        seen.set(r.author.id, r.author);
      }
    });
    return Array.from(seen.values());
  }, [requests]);

  const filtered = useMemo(() => {
    return requests.filter(r => {
      if (authorFilter !== "all" && r.author?.id !== authorFilter) return false;
      if (statusFilter === "active" && !r.active) return false;
      if (statusFilter === "inactive" && r.active) return false;
      if (query) {
        const q = query.toLowerCase();
        const hay = `${r.name} ${r.author?.email || ""} ${r.author?.fullName || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [requests, query, authorFilter, statusFilter]);

  const handleToggleActive = async (request) => {
    if (togglingId) return;
    setTogglingId(request.id);
    try {
      if (request.active) await deactivateTeamTransferRequest(request.id);
      else await activateTeamTransferRequest(request.id);
      toast.success(request.active ? "Link deactivated" : "Link reactivated");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const result = await deleteTeamTransferRequest(deleteTarget.id);
      const n = result.deletedTransfersCount || 0;
      toast.success("Request deleted", {
        description: n > 0
          ? `Deleted the link and ${n} received transfer${n === 1 ? "" : "s"}.`
          : "The request link was deleted.",
      });
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const hasRequests = requests.length > 0;
  const previewTransfers = deleteTarget?.receivedTransfers?.slice(0, 8) || [];
  const extraTransfers = deleteTarget ? (deleteTarget.receivedTransfersCount - previewTransfers.length) : 0;

  const side = hasRequests ? (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="text-white whitespace-nowrap">
        {filtered.length} of {requests.length}
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
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger variant="white" className="w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ) : null;

  return (
    <GenericPage title="Requests" side={side}>
      <div className="space-y-3">
        {!hasRequests ? (
          <EmptySpace
            title="See Every Request Link Your Team Creates"
            subtitle="Once members start creating request links, you'll see every one here with received transfer counts and the option to deactivate or remove them."
          />
        ) : (
          <AdminCard>
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">
                No requests match your filters.
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-xs uppercase tracking-wider text-gray-500 bg-gray-50 border-b">
                  <div className="col-span-5">Request</div>
                  <div className="col-span-3">Created by</div>
                  <div className="col-span-2">Received</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1" />
                </div>
                {filtered.map(r => (
                  <Row
                    key={r.id}
                    request={r}
                    canManage={canManage}
                    busy={togglingId === r.id}
                    onToggleActive={handleToggleActive}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
            )}
          </AdminCard>
        )}

        {!canManage && hasRequests && (
          <p className="text-xs text-white px-1">
            Only the Owner can deactivate or delete other members' request links.
          </p>
        )}

        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader variant="destructive">
              <DialogTitle>Delete request{deleteTarget?.name ? ` "${deleteTarget.name}"` : ""}?</DialogTitle>
              <DialogDescription>
                {deleteTarget && deleteTarget.receivedTransfersCount === 0
                  ? `The request link by ${deleteTarget.author?.email || "an unknown member"} will be permanently deleted.`
                  : deleteTarget
                    ? `This will permanently delete the request link and the ${deleteTarget.receivedTransfersCount} received transfer${deleteTarget.receivedTransfersCount === 1 ? "" : "s"} listed below.`
                    : ""}
              </DialogDescription>
            </DialogHeader>
            {deleteTarget && deleteTarget.receivedTransfersCount > 0 && (
              <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 max-h-56 overflow-y-auto">
                <ul className="divide-y divide-gray-200">
                  {previewTransfers.map(t => (
                    <li key={t.id} className="px-3 py-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-gray-900 truncate">{t.name}</span>
                      <span className="text-gray-500 shrink-0">{t.fileCount} file{t.fileCount === 1 ? "" : "s"}</span>
                    </li>
                  ))}
                  {extraTransfers > 0 && (
                    <li className="px-3 py-2 text-sm text-gray-500">
                      and {extraTransfers} more
                    </li>
                  )}
                </ul>
              </div>
            )}
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
      </div>
    </GenericPage>
  );
}
