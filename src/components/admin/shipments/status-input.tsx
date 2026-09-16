"use client";

import { Input } from "@/components/ui/input";
import { KNOWN_STATUSES } from "@convex/lib/statusStyles";
import { cn } from "@/lib/utils";

interface StatusInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function StatusInput({ value, onChange, placeholder, className }: StatusInputProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Type any status…"}
      />
      <div className="flex flex-wrap gap-1.5">
        {KNOWN_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors hover:bg-accent",
              value === s && "border-primary bg-primary/10 text-primary"
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
