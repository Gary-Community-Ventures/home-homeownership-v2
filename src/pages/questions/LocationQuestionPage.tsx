import type React from "react";
import { useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function LocationQuestionPage({
  selectedLocations,
  filteredLocations,
  activeLocationIndex,
  isLocationOpen,
  locationSearch,
  setLocationSearch,
  setIsLocationOpen,
  setActiveLocationIndex,
  selectLocation,
}: {
  selectedLocations: string[];
  filteredLocations: { name: string; multiplier: number }[];
  activeLocationIndex: number;
  isLocationOpen: boolean;
  locationSearch: string;
  setLocationSearch: (value: string) => void;
  setIsLocationOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveLocationIndex: React.Dispatch<React.SetStateAction<number>>;
  selectLocation: (location: string, index?: number) => void;
}) {
  const [activeSelectIndex, setActiveSelectIndex] = useState(0);
  const [blankSelectCount, setBlankSelectCount] = useState(0);
  const selectCount = Math.max(1, selectedLocations.length) + blankSelectCount;

  function openSelect(index: number, search = "") {
    setActiveSelectIndex(index);
    setLocationSearch(search);
    setIsLocationOpen(true);
    setActiveLocationIndex(0);
  }

  function chooseLocation(location: string, index: number) {
    selectLocation(location, index);
    setBlankSelectCount((current) => Math.max(0, current - (index >= selectedLocations.length ? 1 : 0)));
    setActiveSelectIndex(index);
  }

  function handleSelectKeyDown(event: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsLocationOpen(true);
      setActiveLocationIndex((current) => (filteredLocations.length ? (current + 1) % filteredLocations.length : 0));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setIsLocationOpen(true);
      setActiveLocationIndex((current) => (filteredLocations.length ? (current - 1 + filteredLocations.length) % filteredLocations.length : 0));
    }

    if (event.key === "Enter" && isLocationOpen && filteredLocations[activeLocationIndex]) {
      event.preventDefault();
      chooseLocation(filteredLocations[activeLocationIndex].name, index);
    }

    if (event.key === "Escape") {
      setIsLocationOpen(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Colorado location</span>
        {Array.from({ length: selectCount }).map((_, selectIndex) => {
          const selectedLocation = selectedLocations[selectIndex] ?? "";
          const isActiveSelect = isLocationOpen && activeSelectIndex === selectIndex;
          const inputValue = isActiveSelect ? locationSearch : selectedLocation;
          const isAddedBlankSelect = !selectedLocation && selectIndex >= Math.max(1, selectedLocations.length);

          return (
            <div
              key={`${selectedLocation || "empty"}-${selectIndex}`}
              className="relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setIsLocationOpen(false);
              }}
            >
              <div className="relative">
                <Input
                  role="combobox"
                  aria-expanded={isActiveSelect}
                  aria-activedescendant={isActiveSelect && filteredLocations[activeLocationIndex] ? `location-${selectIndex}-option-${activeLocationIndex}` : undefined}
                  value={inputValue}
                  onFocus={(event) => {
                    openSelect(selectIndex, selectedLocation);
                    event.currentTarget.select();
                  }}
                  onChange={(event) => openSelect(selectIndex, event.target.value)}
                  onKeyDown={(event) => handleSelectKeyDown(event, selectIndex)}
                  placeholder="Search for a neighborhood, city, or county"
                  className="h-12 bg-white pr-20 text-base"
                />
                {selectedLocation || isAddedBlankSelect ? (
                  <button
                    type="button"
                    aria-label={selectedLocation ? `Remove ${selectedLocation}` : "Remove empty location"}
                    onClick={() => {
                      if (selectedLocation) selectLocation(selectedLocation);
                      else setBlankSelectCount((current) => Math.max(0, current - 1));
                      setIsLocationOpen(false);
                      setLocationSearch("");
                    }}
                    className="absolute right-10 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
                <button
                  type="button"
                  aria-label="Toggle location suggestions"
                  onClick={() => (isActiveSelect ? setIsLocationOpen((current) => !current) : openSelect(selectIndex, selectedLocation))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChevronsUpDown className="h-4 w-4" />
                </button>
              </div>

              {isActiveSelect ? (
                <div className="absolute z-20 mt-2 max-h-64 w-full overflow-auto rounded-md border bg-white p-1 shadow-xl" role="listbox">
                  {filteredLocations.length ? (
                    filteredLocations.map((locationOption, index) => {
                      const isSelected = selectedLocations.includes(locationOption.name);
                      const isActive = index === activeLocationIndex;

                      return (
                        <button
                          key={locationOption.name}
                          id={`location-${selectIndex}-option-${index}`}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onMouseDown={(event) => event.preventDefault()}
                          onMouseEnter={() => setActiveLocationIndex(index)}
                          onClick={() => chooseLocation(locationOption.name, selectIndex)}
                          className={`flex w-full items-center justify-between gap-3 rounded-sm px-3 py-2 text-left text-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isActive ? "bg-muted" : ""}`}
                        >
                          <span>{locationOption.name}</span>
                          {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                        </button>
                      );
                    })
                  ) : (
                    <p className="px-3 py-2 text-sm text-muted-foreground">No Colorado locations found.</p>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => {
          setBlankSelectCount((current) => current + 1);
          setIsLocationOpen(false);
          setLocationSearch("");
        }}
        className="inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-2 text-sm font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="h-4 w-4" />
        Add another location
      </button>
      <p className="text-sm leading-6 text-muted-foreground">
        Choose one or more Colorado neighborhoods, cities, or counties; neighborhood and city options include county names for context.
      </p>
    </div>
  );
}
