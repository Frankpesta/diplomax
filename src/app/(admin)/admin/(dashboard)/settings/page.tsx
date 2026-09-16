import type { Metadata } from "next";
import { ProfileForm } from "@/components/admin/settings/profile-form";
import { PasswordForm } from "@/components/admin/settings/password-form";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your admin account profile and security.
        </p>
      </div>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            Update your display name.
          </p>
        </div>
        <ProfileForm />
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Change Password</h2>
          <p className="text-sm text-muted-foreground">
            A one-time reset code will be sent to your registered email address.
          </p>
        </div>
        <PasswordForm />
      </section>
    </div>
  );
}

