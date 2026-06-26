import { ArrowRight } from "lucide-react";

const steps = ["Answer questions", "Check readiness", "Explore help"];

export function WhatThisIsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 to-white/85 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Colorado buyer roadmap</p>
        <h3 className="mt-2 text-xl font-black tracking-tight">Colorado Homeownership Readiness Guide</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Answer a few quick questions and get a clearer path to homeownership based on where you want to live, what you earn, the home you need, your credit, and available assistance.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        {steps.map((title, index) => (
          <div key={title} className="contents">
            <div className="rounded-3xl border bg-white/75 p-4 text-center">
              <p className="font-black tracking-tight">{title}</p>
            </div>
            {index < 2 ? (
              <div className="flex justify-center text-primary" aria-hidden="true">
                <ArrowRight className="h-6 w-6 rotate-90 sm:rotate-0" />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <p className="rounded-3xl bg-muted/70 p-4 text-sm leading-6 text-muted-foreground">
        Treat the numbers as educational estimates, not loan approval, legal advice, or a replacement for a lender, realtor, housing counselor, or tax professional.
      </p>
    </div>
  );
}
