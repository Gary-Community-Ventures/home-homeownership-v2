import { TriangleAlert } from "lucide-react";

export function BedroomsQuestionPage({
  answerValue,
  result,
  selectedLocations,
  bedroomOptions,
  formatCurrency,
  estimateHousingForBedrooms,
  getLocationMultiplier,
  setModeledLocationOverride,
  updateAnswer,
  HouseSizeSvg,
}: any) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {bedroomOptions.map((bedrooms: number) => {
          const estimate = estimateHousingForBedrooms(bedrooms, result.modeledLocation);
          const isSelected = Number(answerValue) === bedrooms;
          const label = bedrooms === 0 ? "Empty lot" : `${bedrooms} bed${bedrooms === 1 ? "" : "s"}`;

          return (
            <button
              key={bedrooms}
              type="button"
              onClick={() => updateAnswer(bedrooms)}
              className={`rounded-3xl border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isSelected ? "border-primary bg-primary/10 shadow-glow" : "bg-white/75"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black tracking-tight">{label}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {bedrooms === 0 ? "land only" : `~${estimate.estimatedSquareFeet.toLocaleString()} sq ft`}
                  </p>
                </div>
                <span className={`h-4 w-4 rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
              </div>
              <div className="mt-2">
                <HouseSizeSvg bedrooms={bedrooms} squareFeet={estimate.estimatedSquareFeet} compact />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-2xl bg-white/80 p-2.5">
                  <p className="text-muted-foreground">Rent</p>
                  <p className="mt-1 font-bold">{bedrooms === 0 ? "N/A" : formatCurrency(estimate.monthlyRent)}</p>
                </div>
                <div className="rounded-2xl bg-white/80 p-2.5">
                  <p className="text-muted-foreground">Mortgage</p>
                  <p className="mt-1 font-bold">{formatCurrency(estimate.monthlyMortgage)}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedLocations.length > 1 ? (
        <div className="rounded-3xl border border-amber-300/70 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <div className="space-y-3">
              <p>
                For the house-cost estimate, click a place below to model the bedroom cards above with that market: <span className="font-bold">{result.modeledLocation}</span>. Down payment assistance includes programs for any selected county.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {[...selectedLocations]
                  .sort((first, second) => getLocationMultiplier(first) - getLocationMultiplier(second))
                  .map((location) => {
                    const estimate = estimateHousingForBedrooms(Number(answerValue), location);
                    const isModeled = location === result.modeledLocation;

                    return (
                      <button
                        key={location}
                        type="button"
                        onClick={() => setModeledLocationOverride(location)}
                        className={`rounded-2xl border bg-white/80 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isModeled ? "border-amber-400" : "border-amber-200"}`}
                        aria-label={`Model bedroom costs with ${location}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-black tracking-tight text-foreground">{location}</p>
                          {isModeled ? <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-[0.14em] text-amber-700">Modeled</span> : null}
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <p>Estimated price</p>
                            <p className="mt-1 font-bold text-foreground">{formatCurrency(estimate.estimatedPrice)}</p>
                          </div>
                          <div>
                            <p>Mortgage</p>
                            <p className="mt-1 font-bold text-foreground">{formatCurrency(estimate.monthlyMortgage)}/mo</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
