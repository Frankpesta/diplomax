import { convexAuth } from "@convex-dev/auth/server";
import { passwordReset } from "./passwordReset";
import { Password } from "@convex-dev/auth/providers/Password";
import { passwordProfile, validatePassword } from "./lib/authPolicy";
import { assertAdministrator, provisionFirstAdmin } from "./lib/admin";
import type { DataModel } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password<DataModel>({ profile: passwordProfile, validatePasswordRequirements: validatePassword, reset: passwordReset })],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, args) {
      if (args.existingUserId !== null) return;
      // This callback runs in the SAME mutation that creates the user/account.
      // Convex serializes conflicting reads/writes: concurrent setup loses and rolls back.
      if (args.type !== "credentials" || args.provider.id !== "password") {
        throw new Error("Admin registration is closed");
      }
      await provisionFirstAdmin(ctx as MutationCtx, args.userId);
    },
    async beforeSessionCreation(ctx, { userId }) {
      await assertAdministrator(ctx as MutationCtx, userId);
    },
  },
});


