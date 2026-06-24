import { ArrowRight } from "lucide-react";

export function WhatThisIsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/10 to-white/85 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Quick planning tool</p>
        <h3 className="mt-2 text-xl font-black tracking-tight">A first-pass readiness guide for Colorado homeownership</h3>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This prototype helps you explore how close you may be to buying based on location, income, home size, credit, and down payment assistance.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
        {[
          { title: "Answer a few prompts", description: "Share rough planning inputs instead of exact financial documents." },
          { title: "Watch the result move", description: "Each answer updates the readiness meter and explains why." },
          { title: "Find next steps", description: "Review assistance programs and resources to verify with professionals." },
        ].map((item, index) => (
          <div key={item.title} className="contents">
            <div className="rounded-3xl border bg-white/75 p-4">
              <p className="font-black tracking-tight">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
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
