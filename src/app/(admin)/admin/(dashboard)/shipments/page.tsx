"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePaginatedQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/admin/shipments/status-badge";
import { DeleteConfirmDialog } from "@/components/admin/shipments/delete-confirm-dialog";
import { StatusUpdateDialog } from "@/components/admin/shipments/status-update-dialog";
import { SHIPMENT_TYPES } from "@/types/wizard";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader2,
  Package,
  RefreshCw,
} from "lucide-react";

export default function ShipmentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    id: Id<"shipments">;
    code: string;
  } | null>(null);

  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    id: Id<"shipments">;
    current: string;
  } | null>(null);

  const { results, status, loadMore } = usePaginatedQuery(
    api.shipments.listShipments,
    {
      filters: {
        archived: showArchived,
        status: statusFilter !== "all" ? statusFilter : undefined,
        shipmentType: typeFilter !== "all" ? typeFilter : undefined,
      },
    },
    { initialNumItems: 25 }
  );

  const archiveShipment = useMutation(api.shipments.archiveShipment);
  const restoreShipment = useMutation(api.shipments.restoreShipment);

  const filtered = results.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.trackingCode.toLowerCase().includes(q) ||
      s.senderFullName.toLowerCase().includes(q) ||
      s.receiverFullName.toLowerCase().includes(q) ||
      s.senderCity?.toLowerCase().includes(q) ||
      s.receiverCity?.toLowerCase().includes(q)
    );
  });

  async function handleArchive(id: Id<"shipments">, code: string) {
    try {
      await archiveShipment({ id });
      toast.success(`${code} archived.`);
    } catch {
      toast.error("Failed to archive shipment.");
    }
  }

  async function handleRestore(id: Id<"shipments">, code: string) {
    try {
      await restoreShipment({ id });
      toast.success(`${code} restored.`);
    } catch {
      toast.error("Failed to restore shipment.");
    }
  }

  const isLoading = status === "LoadingFirstPage";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shipments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {isLoading
              ? "Loading..."
              : `${filtered.length} shipment${filtered.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
        <Button render={<Link href="/admin/shipments/new" />}>
          <Plus className="mr-2 h-4 w-4" /> New Shipment
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tracking code, sender, receiver..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Input
          placeholder="Filter by status..."
          value={statusFilter === "all" ? "" : statusFilter}
          onChange={(e) => setStatusFilter(e.target.value || "all")}
          className="w-44"
        />

        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v ?? "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {SHIPMENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant={showArchived ? "default" : "outline"}
          size="sm"
          onClick={() => setShowArchived((v) => !v)}
        >
          <Archive className="mr-2 h-4 w-4" />
          {showArchived ? "Showing Archived" : "Archived"}
        </Button>

        {(search || statusFilter !== "all" || typeFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setTypeFilter("all");
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tracking Code</TableHead>
              <TableHead>Sender</TableHead>
              <TableHead>Receiver</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[52px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-40 text-center">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No shipments found.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s._id}>
                  <TableCell className="font-mono text-xs font-semibold">
                    <Link
                      href={`/admin/shipments/${s.trackingCode}`}
                      className="hover:text-primary transition-colors"
                    >
                      {s.trackingCode}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{s.senderFullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.senderCity}, {s.senderCountry}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{s.receiverFullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.receiverCity}, {s.receiverCountry}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm">{s.shipmentType}</TableCell>
                  <TableCell>
                    <StatusBadge status={s.status} />
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    ${s.totalCost.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/shipments/${s.trackingCode}`)
                          }
                        >
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/admin/shipments/new?edit=${s.trackingCode}`
                            )
                          }
                        >
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            setStatusDialog({
                              open: true,
                              id: s._id,
                              current: s.status,
                            })
                          }
                        >
                          <RefreshCw className="mr-2 h-4 w-4" /> Update Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {s.archived ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleRestore(s._id, s.trackingCode)
                            }
                          >
                            <ArchiveRestore className="mr-2 h-4 w-4" /> Restore
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handleArchive(s._id, s.trackingCode)
                            }
                          >
                            <Archive className="mr-2 h-4 w-4" /> Archive
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              id: s._id,
                              code: s.trackingCode,
                            })
                          }
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Load more */}
      {status === "CanLoadMore" && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => loadMore(25)}>
            Load more
          </Button>
        </div>
      )}

      {/* Dialogs */}
      {deleteDialog && (
        <DeleteConfirmDialog
          open={deleteDialog.open}
          onOpenChange={(open) => setDeleteDialog(open ? deleteDialog : null)}
          shipmentId={deleteDialog.id}
          trackingCode={deleteDialog.code}
        />
      )}
      {statusDialog && (
        <StatusUpdateDialog
          open={statusDialog.open}
          onOpenChange={(open) => setStatusDialog(open ? statusDialog : null)}
          shipmentId={statusDialog.id}
          currentStatus={statusDialog.current}
        />
      )}
    </div>
  );
}
