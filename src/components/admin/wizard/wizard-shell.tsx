"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Sender" },
  { label: "Receiver" },
  { label: "Items" },
  { label: "Pricing" },
  { label: "Route" },
  { label: "Review" },
];

interface WizardShellProps {
  currentStep: number;
  children: React.ReactNode;
}

export function WizardShell({ currentStep, children }: WizardShellProps) {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Step indicator */}
      <div className="flex items-center mb-8 px-2">
        {STEPS.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <Fragment key={stepNum}>
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </div>
                <span
                  className={cn(
                    "text-[10px] hidden sm:block leading-tight text-center",
                    isCurrent
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 mb-[18px] transition-colors",
                    stepNum < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">{children}</div>
    </div>
  );
}
