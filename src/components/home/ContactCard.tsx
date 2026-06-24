import { ExternalLink } from "lucide-react";

type Contact = {
  id: string;
  name: string;
  company: string;
  phone?: string;
  email?: string;
  nmls?: string;
  award?: string;
  languages?: string;
  website?: string;
  specialties?: string[];
  countiesServed: string[];
  notes?: string;
};

export function ContactCard({ contact, selected, compact = false, onSelect }: { contact: Contact; selected?: boolean; compact?: boolean; onSelect?: (contactId: string) => void }) {
  const detailClass = compact ? "" : "rounded-2xl bg-white/80 p-2.5";
  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`${compact ? "text-sm" : ""} font-black tracking-tight`}>{contact.name}</p>
          <p className={`${compact ? "mt-0.5 text-[0.65rem]" : "mt-1 text-xs"} font-semibold uppercase tracking-[0.16em] text-muted-foreground`}>{contact.company}</p>
        </div>
        {selected !== undefined ? <span className={`h-4 w-4 rounded-full border-2 ${selected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} /> : null}
      </div>

      <div className={`${compact ? "mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[0.7rem]" : "mt-3 grid gap-2 text-xs sm:grid-cols-2"}`}>
        {contact.phone ? <p className={detailClass}><span className="text-muted-foreground">Phone </span><span className="font-bold">{contact.phone}</span></p> : null}
        {contact.email ? <p className={`break-words ${detailClass}`}><span className="text-muted-foreground">Email </span><span className="font-bold">{contact.email}</span></p> : null}
        {!compact && contact.nmls ? <p className={detailClass}><span className="text-muted-foreground">NMLS </span><span className="font-bold">{contact.nmls}</span></p> : null}
        {!compact && contact.award ? <p className={detailClass}><span className="text-muted-foreground">Award </span><span className="font-bold">{contact.award}</span></p> : null}
      </div>

      {!compact ? (
        <>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Serves: {contact.countiesServed.includes("all") ? "All listed Colorado counties" : contact.countiesServed.join(", ")}</p>
          {contact.languages ? <p className="mt-1 text-sm leading-6 text-muted-foreground">Languages: {contact.languages}</p> : null}
          {contact.specialties?.length ? <p className="mt-1 text-sm leading-6 text-muted-foreground">Specialties: {contact.specialties.join(", ")}</p> : null}
          {contact.notes ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{contact.notes}</p> : null}
          {contact.website ? (
            <a href={contact.website} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center text-sm font-bold text-primary underline-offset-4 hover:underline">
              Website
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </a>
          ) : null}
        </>
      ) : null}
    </>
  );

  if (!onSelect) {
    return <div className={compact ? "py-2" : "rounded-3xl border bg-white/75 p-4"}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(contact.id)}
      className={`${compact ? "rounded-2xl p-3" : "rounded-3xl p-4"} border text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? "border-primary bg-primary/10 shadow-glow" : "bg-white/75"}`}
    >
      {content}
    </button>
  );
}
