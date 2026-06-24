export function HouseSizeSvg({ bedrooms, squareFeet, compact = false }: { bedrooms: number; squareFeet: number; compact?: boolean }) {
  const bedroomCount = Math.max(0, Math.min(8, Math.round(bedrooms || 0)));
  const isEmptyLot = bedroomCount === 0;
  const houseWidth = 132 + bedroomCount * 18;
  const houseHeight = 64 + bedroomCount * 4;
  const houseX = (360 - houseWidth) / 2;
  const houseY = 128 - houseHeight;
  const roofPeakY = houseY - 42;
  const windowCount = Math.min(bedroomCount, 6);
  const windowSpacing = houseWidth / (windowCount + 1);

  return (
    <div className={`rounded-3xl border bg-gradient-to-b from-primary/10 to-white/80 ${compact ? "p-2" : "p-4"}`}>
      {!compact ? (
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span className="font-semibold uppercase tracking-[0.2em] text-muted-foreground">House size</span>
          <span className="font-bold text-primary">{isEmptyLot ? "Empty lot" : `~${squareFeet.toLocaleString()} sq ft`}</span>
        </div>
      ) : null}
      <svg viewBox="0 0 360 180" role="img" aria-label={isEmptyLot ? "Empty lot with no house" : `Estimated house size for ${bedroomCount} bedrooms`} className={`${compact ? "h-20" : "h-44"} w-full overflow-visible`}>
        <path d="M28 146 C88 128 134 158 190 140 S290 132 332 148" fill="none" stroke="hsl(var(--primary) / 0.25)" strokeWidth="12" strokeLinecap="round" />
        {isEmptyLot ? (
          <>
            <rect x="74" y="78" width="212" height="68" rx="14" fill="hsl(var(--accent) / 0.45)" stroke="hsl(var(--primary))" strokeWidth="4" strokeDasharray="10 8" />
            <path d="M104 126 C138 108 164 132 196 112 S244 102 260 124" fill="none" stroke="hsl(var(--primary) / 0.45)" strokeWidth="5" strokeLinecap="round" />
            <text x="180" y="113" textAnchor="middle" className="fill-primary text-lg font-black">Empty lot</text>
          </>
        ) : (
          <>
            <rect x={houseX} y={houseY} width={houseWidth} height={houseHeight} rx="10" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="4" />
            <path d={`M${houseX - 12} ${houseY + 8} L180 ${roofPeakY} L${houseX + houseWidth + 12} ${houseY + 8} Z`} fill="hsl(var(--secondary))" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinejoin="round" />
            <rect x={180 - houseWidth * 0.08} y={houseY + houseHeight - 42} width={houseWidth * 0.16} height="42" rx="6" fill="hsl(var(--primary) / 0.22)" stroke="hsl(var(--primary))" strokeWidth="3" />
            {Array.from({ length: windowCount }).map((_, index) => {
              const x = houseX + windowSpacing * (index + 1) - 12;
              return <rect key={index} x={x} y={houseY + 22} width="24" height="22" rx="5" fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth="3" />;
            })}
          </>
        )}
      </svg>
    </div>
  );
}

export function WalkingPersonSvg({ direction }: { direction: "rent" | "buy" }) {
  const facingBuy = direction === "buy";

  return (
    <svg viewBox="0 0 64 72" aria-hidden="true" className={`h-6 w-6 overflow-visible ${facingBuy ? "" : "-scale-x-100"}`}>
      <path d="M14 64 C26 58 40 58 52 64" fill="none" stroke="hsl(var(--foreground) / 0.18)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="36" cy="13" r="8" fill="hsl(var(--secondary))" stroke="hsl(var(--foreground))" strokeWidth="3" />
      <path d="M34 23 L31 41" fill="none" stroke="hsl(var(--foreground))" strokeWidth="6" strokeLinecap="round" />
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-18 32 30; 20 32 30; -18 32 30" dur="0.7s" repeatCount="indefinite" />
        <path d="M32 28 L18 39" fill="none" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="18 32 30; -20 32 30; 18 32 30" dur="0.7s" repeatCount="indefinite" />
        <path d="M32 28 L48 35" fill="none" stroke="hsl(var(--primary))" strokeWidth="5" strokeLinecap="round" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="20 31 41; -18 31 41; 20 31 41" dur="0.7s" repeatCount="indefinite" />
        <path d="M31 41 L19 58" fill="none" stroke="hsl(var(--foreground))" strokeWidth="6" strokeLinecap="round" />
      </g>
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-18 31 41; 20 31 41; -18 31 41" dur="0.7s" repeatCount="indefinite" />
        <path d="M31 41 L48 56" fill="none" stroke="hsl(var(--foreground))" strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  );
}
