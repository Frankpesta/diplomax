"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeLabels: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  shipments: "Shipments",
  new: "New Shipment",
  edit: "Edit",
  analytics: "Analytics",
  "audit-log": "Audit Log",
  settings: "Settings",
  notifications: "Email notifications",
};

function getLabel(segment: string): string {
  // If it looks like an ID (long alphanumeric), label it "Details"
  if (segment.length > 16 && /^[a-zA-Z0-9]+$/.test(segment)) {
    return "Details";
  }
  return routeLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function BreadcrumbNav() {
  const pathname = usePathname();

  // Strip the leading /admin prefix — we start breadcrumbs from the first real segment
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((s) => s !== "admin");

  if (segments.length === 0) return null;

  const crumbs = segments.map((segment, index) => {
    const href =
      "/admin/" + segments.slice(0, index + 1).join("/");
    const label = getLabel(segment);
    const isLast = index === segments.length - 1;
    return { href, label, isLast };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.isLast ? (
                <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink render={<Link href={crumb.href} />}>
                  {crumb.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

