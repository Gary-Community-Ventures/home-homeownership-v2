import { ContactCard } from "@/components/home/ContactCard";

type Contact = Parameters<typeof ContactCard>[0]["contact"];

export function ContactPickerPage({
  contacts,
  locations,
  sortContactsForLocations,
}: {
  type: "lender" | "realtor";
  contacts: Contact[];
  selectedContactId: string | null;
  locations: string[];
  getCountyNames: (locations: string[]) => string[];
  contactMatchesCounty: (contact: Contact, countyNames: string[]) => boolean;
  sortContactsForLocations: (contacts: Contact[], locations: string[]) => Contact[];
  onSelect: (contactId: string) => void;
}) {
  const sortedContacts = sortContactsForLocations(contacts, locations);

  return (
    <div className="divide-y divide-border/70">
      {sortedContacts.map((contact) => (
        <ContactCard key={contact.id} contact={contact} compact />
      ))}
    </div>
  );
}
