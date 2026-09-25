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
import { WhatsAppIcon } from "@/components/public/whatsapp-icon";
import { useI18n } from "@/i18n/provider";
import { WHATSAPP_DISPLAY, whatsappUrl } from "@/lib/contact";
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

/** Values must match the contact policy enum — they are what the support inbox receives. */
const SUBJECTS = [
  "General Enquiry",
  "Track a Shipment",
  "Sales & Pricing",
  "Partnership",
  "Technical Support",
  "Other",
] as const;

const CONTACT_PHOTO =
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85";

export default function ContactPage() {
  const { t } = useI18n();
  const c = t.contact;
  const sendContact = useAction(api.emails.sendContactEmail);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [challengeKey, setChallengeKey] = useState(0);

  const [form, setForm] = useState<{ name: string; email: string; subject: (typeof SUBJECTS)[number]; message: string }>({
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
    ) => setForm((f) => ({ ...f, [field]: e.target.value }) as typeof f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg(c.errorRequired);
      return;
    }
    if (!turnstileToken) { setErrorMsg(c.errorVerification); return; }
    setStatus("sending");
    setErrorMsg("");
    try {
      await sendContact({ ...form, turnstileToken });
      setStatus("sent");
    } catch {
      setStatus("error");
      setErrorMsg(c.errorFailed);
    } finally {
      setTurnstileToken("");
      setChallengeKey(value => value + 1);
    }
  }

  const contactDetails = [
    { icon: Mail, label: c.supportLabel, lines: ["support@diplomaxdelivery.com", c.supportHint] },
    { icon: Send, label: c.planningLabel, lines: [c.planningHint] },
  ];

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
              {c.kicker}
            </p>
            <h1 className="text-5xl font-medium leading-[1.08] tracking-[-.05em] sm:text-6xl">
              {c.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/70">
              {c.text}
            </p>
          </div>
          <div className="relative h-[360px] w-full overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
            <Image
              src={CONTACT_PHOTO}
              alt={c.photoAlt}
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
              <h2 className="text-xl font-bold mb-6">{c.infoTitle}</h2>
              <div className="space-y-6">
                {contactDetails.map((detail) => (
                  <div key={detail.label} className="flex gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <detail.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm mb-1">{detail.label}</div>
                      {detail.lines.map((line) => (
                        <div key={line} className="text-sm text-muted-foreground">
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="h-5 w-5 text-[#1da851]" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">{c.whatsappLabel}</div>
                    <a href={whatsappUrl(t.whatsapp.message)} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
                      {WHATSAPP_DISPLAY}
                    </a>
                    <div className="text-sm text-muted-foreground">{c.whatsappHint}</div>
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
                <h3 className="font-semibold text-sm mb-2">{c.trackTitle}</h3>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  {c.trackText}
                </p>
                <Link
                  href="/#track"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  {c.trackLink} →
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
                  <h2 className="text-xl font-bold mb-2">{c.sentTitle}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                    {c.sentText.split("{email}").map((part, i) => (
                      <span key={i}>{i > 0 && <strong>{form.email}</strong>}{part}</span>
                    ))}
                  </p>
                  <button
                    className="mt-6 text-sm text-primary font-semibold hover:underline"
                    onClick={() => {
                      setStatus("idle");
                      setForm({ name: "", email: "", subject: SUBJECTS[0], message: "" });
                    }}
                  >
                    {c.sendAnother}
                  </button>
                </motion.div>
              ) : (
                <div className="bg-card border rounded-2xl p-8">
                  <h2 className="text-xl font-bold mb-6">{c.formTitle}</h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="block text-xs font-semibold mb-1.5">
                          {c.name} <span className="text-red-500">*</span>
                        </label>
                        <input
                          className={inputCls}
                          id="contact-name" autoComplete="name" maxLength={100} minLength={2} required placeholder={c.namePlaceholder}
                          value={form.name}
                          onChange={set("name")}
                          disabled={status === "sending"}
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-xs font-semibold mb-1.5">
                          {c.email} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          className={inputCls}
                          id="contact-email" autoComplete="email" maxLength={254} required placeholder={c.emailPlaceholder}
                          value={form.email}
                          onChange={set("email")}
                          disabled={status === "sending"}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="contact-subject" className="block text-xs font-semibold mb-1.5">{c.subject}</label>
                      <select id="contact-subject"
                        className={inputCls}
                        value={form.subject}
                        onChange={set("subject")}
                        disabled={status === "sending"}
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>{c.subjects[s]}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="contact-message" className="block text-xs font-semibold mb-1.5">
                        {c.message} <span className="text-red-500">*</span>
                      </label>
                      <textarea id="contact-message"
                        className={`${inputCls} min-h-[140px] resize-none`}
                        minLength={10} maxLength={5000} required placeholder={c.messagePlaceholder}
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
                          <Loader2 className="h-4 w-4 animate-spin" /> {c.sending}
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" /> {c.send}
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






