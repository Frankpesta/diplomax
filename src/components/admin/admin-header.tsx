"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbNav } from "@/components/admin/breadcrumb-nav";

export function AdminHeader() {
  return (
    <header className="flex h-20 items-center gap-3 border-b bg-card/90 backdrop-blur-xl px-6 sticky top-0 z-10">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <BreadcrumbNav />
    </header>
  );
}

