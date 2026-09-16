import { cn } from "@/lib/utils";
export function Logo({ variant = "dark", height = 40, className }: { variant?: "dark" | "light"; height?: number; className?: string }) {
  return <span aria-label="Diplomaxdelivery" className={cn("brand-logo inline-flex items-center gap-2.5", variant === "light" ? "text-white" : "text-foreground", className)} style={{ height }}>
    <svg viewBox="0 0 48 48" height={height} width={height} fill="none" aria-hidden="true" className="shrink-0"><rect width="48" height="48" rx="14" fill="#C7F36B" /><path d="M12 13h13c9 0 14 5 14 11s-5 11-14 11H12l5-8h8c3 0 5-1 5-3s-2-3-5-3H12l5-4-5-4Z" fill="#123D32" /><path d="m8 22 7 2-7 2" stroke="#123D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    <span className="flex flex-col leading-none"><span className="font-extrabold tracking-[-0.055em]" style={{ fontSize: height * .54 }}>diplomax<span className="text-[#73a940]">.</span></span><span className="mt-1 font-semibold uppercase tracking-[0.32em] opacity-65" style={{ fontSize: height * .2 }}>delivery</span></span>
  </span>;
}
