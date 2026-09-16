"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useState } from "react";

interface LogoutButtonProps {
  variant?: "default" | "ghost" | "outline";
  showIcon?: boolean;
}

export function LogoutButton({
  variant = "ghost",
  showIcon = true,
}: LogoutButtonProps) {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    try {
      await signOut();
      router.push("/admin/login");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className="w-full justify-start gap-2 text-sidebar-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {isPending ? "Signing out…" : "Sign Out"}
    </Button>
  );
}
