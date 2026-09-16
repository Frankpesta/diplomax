"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusInput } from "@/components/admin/shipments/status-input";
import { Loader2 } from "lucide-react";

interface Props {
  shipmentId: Id<"shipments">;
  currentStatus: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatusUpdateDialog({
  shipmentId,
  currentStatus,
  open,
  onOpenChange,
}: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const updateStatus = useMutation(api.shipments.updateShipmentStatus);

  async function handleUpdate() {
    const trimmed = status.trim();
    if (!trimmed) return;
    if (trimmed === currentStatus) {
      onOpenChange(false);
      return;
    }
    setLoading(true);
    try {
      await updateStatus({ id: shipmentId, status: trimmed });
      toast.success(`Status updated to "${trimmed}"`);
      onOpenChange(false);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle>Update Shipment Status</DialogTitle>
        </DialogHeader>

        <StatusInput value={status} onChange={setStatus} />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading || !status.trim()}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
