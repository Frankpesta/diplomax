"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  BarChart3,
  ClipboardList,
  Settings,
  Mail,
} from "lucide-react";
import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogoutButton } from "@/components/admin/logout-button";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Shipments",
    href: "/admin/shipments",
    icon: Package,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Audit Log",
    href: "/admin/audit-log",
    icon: ClipboardList,
  },
  {
    title: "Email notifications",
    href: "/admin/notifications",
    icon: Mail,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) return email[0].toUpperCase();
  return "A";
}

export function AppSidebar() {
  const pathname = usePathname();
  const currentUser = useQuery(api.users.getCurrentUser);
  const { isMobile } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas">
      {/* ── Header: Logo ── */}
      <SidebarHeader className="border-b border-sidebar-border px-5 py-7">
        <Link href="/admin/dashboard" className="flex flex-col gap-1 group">
          <Logo variant="light" height={34} />
          <span className="text-xs text-sidebar-foreground/60">
            OPERATIONS WORKSPACE
          </span>
        </Link>
      </SidebarHeader>

      {/* ── Manage deliveries ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manage deliveries</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={isMobile ? undefined : item.title}
                      render={<Link href={item.href} />}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: User + Logout ── */}
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground text-xs font-semibold">
              {getInitials(currentUser?.name, currentUser?.email)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {currentUser?.name ?? "Admin"}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {currentUser?.email ?? ""}
            </span>
          </div>
        </div>
        <Separator className="bg-sidebar-border" />
        <div className="px-1 py-1">
          <LogoutButton variant="ghost" showIcon />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}


