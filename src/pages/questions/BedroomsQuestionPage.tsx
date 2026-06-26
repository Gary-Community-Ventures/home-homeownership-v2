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
      <div className="space-y-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Home size</p>
          <h3 className="mt-1 text-lg font-black tracking-tight text-foreground">Choose how many bedrooms you want</h3>
        </div>

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
                  </div>
                  <span className={`h-4 w-4 rounded-full border-2 ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                </div>
                <div className="mt-2">
                  <HouseSizeSvg bedrooms={bedrooms} squareFeet={estimate.estimatedSquareFeet} compact />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-2xl bg-white/80 p-2.5">
                    <p className="text-muted-foreground">Rent</p>
                    <p className="mt-1 text-lg font-black leading-none tracking-tight text-foreground">{bedrooms === 0 ? "N/A" : formatCurrency(estimate.monthlyRent)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/80 p-2.5">
                    <p className="text-muted-foreground">Mortgage</p>
                    <p className="mt-1 text-lg font-black leading-none tracking-tight text-foreground">{formatCurrency(estimate.monthlyMortgage)}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedLocations.length > 0 ? (
        <div className="space-y-3 pt-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Market location</p>
            <h3 className="mt-1 text-lg font-black tracking-tight text-foreground">Choose which place to model</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                    className={`rounded-3xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${isModeled ? "border-primary bg-primary/10 shadow-glow" : "bg-white/75"}`}
                    aria-label={`Model bedroom costs with ${location}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black tracking-tight text-foreground">{location}</p>
                      </div>
                      <span className={`h-4 w-4 rounded-full border-2 ${isModeled ? "border-primary bg-primary" : "border-muted-foreground/40"}`} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs xl:grid-cols-1 2xl:grid-cols-2">
                      <div className="rounded-2xl bg-white/80 p-2.5">
                        <p className="text-muted-foreground">Estimated price</p>
                        <p className="mt-1 whitespace-nowrap text-lg font-black leading-none tracking-tight text-foreground">{formatCurrency(estimate.estimatedPrice)}</p>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-2.5">
                        <p className="text-muted-foreground">Mortgage</p>
                        <p className="mt-1 whitespace-nowrap text-lg font-black leading-none tracking-tight text-foreground">{formatCurrency(estimate.monthlyMortgage)}/mo</p>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
