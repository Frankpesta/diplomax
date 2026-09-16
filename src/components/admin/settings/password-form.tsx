"use client";

import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Mail } from "lucide-react";

export function PasswordForm() {
  const { signIn } = useAuthActions();
  const currentUser = useQuery(api.users.getCurrentUser);
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // ── Step 2: Verify code + set new password ───────────────────────────────
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPending, setConfirmPending] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSendReset() {
    if (!currentUser?.email) return;
    setIsPending(true);
    try {
      await signIn("password", { email: currentUser.email, flow: "reset" });
      setSent(true);
      toast.success("Reset code sent to your email");
    } catch {
      toast.error("Failed to send reset email. Try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handleConfirmReset() {
    if (!currentUser?.email) return;
    setPasswordError(null);
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("Password must contain at least one uppercase letter");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("Password must contain at least one number");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setConfirmPending(true);
    try {
      await signIn("password", {
        email: currentUser.email.trim().toLowerCase(),
        code: code.trim().toUpperCase(),
        newPassword,
        flow: "reset-verification",
      });
      toast.success("Password updated successfully");
      setSent(false);
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Invalid or expired code. Request a new one.");
    } finally {
      setConfirmPending(false);
    }
  }

  if (!sent) {
    return (
      <div className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            We&apos;ll send a one-time reset code to{" "}
            <strong>{currentUser?.email ?? "your email"}</strong>. Enter the
            code below to set a new password.
          </AlertDescription>
        </Alert>
        <Button onClick={handleSendReset} disabled={isPending || !currentUser}>
          {isPending ? "Sending…" : "Send Reset Code"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertDescription>
          Code sent to <strong>{currentUser?.email}</strong>. Enter it below
          along with your new password.
        </AlertDescription>
      </Alert>

      <div className="space-y-3 max-w-sm">
        <div className="space-y-1.5">
          <Label htmlFor="reset-code">Verification Code</Label>
          <Input
            id="reset-code"
            placeholder="Enter code from email"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {passwordError && (
          <p className="text-sm text-destructive">{passwordError}</p>
        )}

        <div className="flex gap-2">
          <Button onClick={handleConfirmReset} disabled={confirmPending}>
            {confirmPending ? "Updating…" : "Update Password"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSent(false);
              setCode("");
              setNewPassword("");
              setConfirmPassword("");
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}


