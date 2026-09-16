"use client";

import { useState } from "react";
import { ContactChallenge } from "@/components/public/contact-challenge";
import Link from "next/link";
import Image from "next/image";
import { useAction } from "convex/react";
import { api } from "@convex/_generated/api";
import { motion } from "framer-motion";
import { NavHeader } from "@/components/public/nav-header";
import { SiteFooter } from "@/components/public/site-footer";
import {
  Mail,
  CheckCircle2,
  Send,
  Loader2,
} from "lucide-react";

function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const CONTACT_DETAILS = [
  { icon: Mail, label: "Shipment support", lines: ["support@diplomaxdelivery.com", "Include your DMD tracking code when contacting us."] },
  { icon: Send, label: "Planning a delivery?", lines: ["Tell us the collection point, destination, and parcel size using the form."] },
];

const SUBJECTS = [
  "General Enquiry",
  "Track a Shipment",
  "Sales & Pricing",
  "Partnership",
  "Technical Support",
  "Other",
];

const CONTACT_PHOTO =
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85";

export default function ContactPage() {
  const sendContact = useAction(api.emails.sendContactEmail);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [challengeKey, setChallengeKey] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: keyof typeof form) {
    return (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!turnstileToken) { setErrorMsg("Please complete the verification first."); return; }
    setStatus("sending");
    setErrorMsg("");
    try {
      await sendContact({ ...form, turnstileToken });
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMsg("Your message could not be accepted. Please check the form, try again later, or email us directly.");
    } finally {
      setTurnstileToken("");
      setChallengeKey(value => value + 1);
    }
  }

  const inputCls =
    "w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-muted-foreground/60";

  return (
    <div className="flex flex-col min-h-screen">
      <NavHeader />

      {/* Hero */}
      <section className="secondary-hero bg-brand-forest px-5 py-16 text-white sm:px-8 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2"
        >
          <div>
            <p className="mb-3 text-sm font-black uppercase text-brand-lime">
              Get in Touch
            </p>
            <h1 className="text-5xl font-medium leading-[1.08] tracking-[-.05em] sm:text-6xl">
              Logistics support without the runaround
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/70">
              Have a question, a large shipment to plan, or a partnership to
              discuss? Our team responds quickly and keeps the handoff clear.
            </p>
          </div>
          <div className="relative h-[360px] w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
            <Image
              src={CONTACT_PHOTO}
              alt="Support team coordinating shipments"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* Contact content */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact details */}
          <div className="lg:col-span-2 space-y-8">
            <FadeUp>
              <h2 className="text-xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                {CONTACT_DETAILS.map((c) => (
                  <div key={c.label} className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <c.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1">{c.label}</div>
                      {c.lines.map((line) => (
                        <div key={line} className="text-sm text-muted-foreground">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-2">Track Your Shipment</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Already have a tracking code? Track your shipment instantly without contacting support.
                </p>
                <Link
                  href="/#track"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  Go to Tracker -
                </Link>
              </div>
            </FadeUp>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <FadeUp delay={0.1}>
              {status === "sent" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border rounded-2xl p-10 text-center"
                >
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Message accepted</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                    Thanks for reaching out. Our team will get back to you at{" "}
                    <strong>{form.email}</strong> as soon as possible.
                  </p>
                  <button
                    className="mt-6 text-sm text-primary font-semibold hover:underline"
                    onClick={() => {
                      setStatus("idle");
                      setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
                    }}
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <div className="bg-card border rounded-2xl p-8">
                  <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-semibold mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          className={inputCls}
                          id="contact-name" autoComplete="name" maxLength={100} minLength={2} required placeholder="John Smith"
                          value={form.name}
                          onChange={set("name")}
                          disabled={status === "sending"}
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-semibold mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          className={inputCls}
                          id="contact-email" autoComplete="email" maxLength={254} required placeholder="john@example.com"
                          value={form.email}
                          onChange={set("email")}
                          disabled={status === "sending"}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-semibold mb-1.5">Subject</label>
                      <select id="contact-subject"
                        className={inputCls}
                        value={form.subject}
                        onChange={set("subject")}
                        disabled={status === "sending"}
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-semibold mb-1.5">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea id="contact-message"
                        className={`${inputCls} min-h-[140px] resize-none`}
                        minLength={10} maxLength={5000} required placeholder="Tell us how we can help..."
                        value={form.message}
                        onChange={set("message")}
                        disabled={status === "sending"}
                      />
                    </div>

                    <ContactChallenge key={challengeKey} onToken={setTurnstileToken} />
                    {errorMsg && (
                      <p role="alert" className="text-red-500 text-xs">{errorMsg}</p>
                    )}

                    <button
                      type="submit"
                      disabled={status === "sending" || !turnstileToken}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> Send Message
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </FadeUp>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}






