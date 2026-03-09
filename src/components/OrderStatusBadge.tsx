/**
 * OrderStatusBadge — Displays a colored badge for order status.
 */

import { Badge } from "@/components/ui/badge";
import type { Order } from "@/data/mockData";

const statusConfig: Record<Order["status"], { label: string; className: string }> = {
  pending:          { label: "Pending",          className: "bg-warning/20 text-warning-foreground border-warning/40" },
  confirmed:        { label: "Confirmed",        className: "bg-info/20 text-info border-info/40" },
  preparing:        { label: "Preparing",        className: "bg-brand/20 text-brand border-brand/40" },
  "out-for-delivery":{ label: "On the way",      className: "bg-info/20 text-info border-info/40" },
  delivered:        { label: "Delivered",        className: "bg-success/20 text-success border-success/40" },
  cancelled:        { label: "Cancelled",        className: "bg-destructive/20 text-destructive border-destructive/40" },
};

interface Props {
  status: Order["status"];
  className?: string;
}

export default function OrderStatusBadge({ status, className = "" }: Props) {
  const cfg = statusConfig[status];
  return (
    <Badge variant="outline" className={`${cfg.className} font-medium ${className}`}>
      {cfg.label}
    </Badge>
  );
}
