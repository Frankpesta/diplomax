"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthActions } from "@convex-dev/auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/logo";

const confirmSchema = z
  .object({
    email: z.string().email("Enter your account email address"),
    code: z.string().trim().min(1, "Verification code is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ConfirmValues = z.infer<typeof confirmSchema>;

export default function ResetPasswordConfirmPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ConfirmValues>({
    resolver: zodResolver(confirmSchema),
    defaultValues: { email: "", code: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(values: ConfirmValues) {
    setError(null);
    setIsPending(true);
    try {
      await signIn("password", {
        email: values.email.trim().toLowerCase(),
        code: values.code.trim().toUpperCase(),
        newPassword: values.newPassword,
        flow: "reset-verification",
      });
      router.push("/admin/dashboard");
    } catch {
      setError("Invalid or expired code. Please request a new reset code.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col gap-2">
        <div className="mb-2">
          <Logo height={40} />
        </div>
        <p className="text-sm font-semibold text-muted-foreground">
          Secure password update
        </p>
      </div>

      <Card className="border-0 p-2 shadow-2xl shadow-slate-950/10 ring-1 ring-slate-950/10">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Set new password</CardTitle>
          <CardDescription>
            Enter the code from your email and choose a new password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Account email address</FormLabel><FormControl>
                  <Input type="email" autoComplete="email" placeholder="Your admin email address" className="h-11" {...field} />
                </FormControl><FormMessage /></FormItem>
              )} />
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter code from email" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="New password" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="h-11 w-full bg-brand-lime font-black text-slate-950 hover:bg-brand-lime/90"
                disabled={isPending}
              >
                {isPending ? "Updating..." : "Set New Password"}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link href="/admin/reset-password" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Request a new code
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

