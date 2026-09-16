"use client";

import { useState } from "react";
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
import { AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetValues = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const { signIn } = useAuthActions();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ResetValues) {
    setError(null);
    setIsPending(true);
    try {
      await signIn("password", { email: values.email, flow: "reset" });
      setSent(true);
    } catch {
      setError("Could not send reset email. Please try again.");
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
          Account recovery
        </p>
      </div>

      <Card className="border-0 p-2 shadow-2xl shadow-slate-950/10 ring-1 ring-slate-950/10">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Reset password</CardTitle>
          <CardDescription>
            Enter your email and we will send a secure reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="font-black">Check your email</p>
              <p className="text-sm text-muted-foreground">
                If an account exists for <strong>{form.getValues("email")}</strong>,
                you will receive a reset link shortly.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@diplomaxdelivery.com"
                            className="h-11"
                            {...field}
                          />
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
                    {isPending ? "Sending..." : "Send Reset Link"}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>

        <CardFooter className="justify-center">
          <Link href="/admin/login" className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
