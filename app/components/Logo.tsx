type LogoProps = {
  showWordmark?: boolean;
};

export function Logo({ showWordmark = true }: LogoProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
        <circle cx="14" cy="14" r="12" stroke="#99F6E4" strokeWidth="2" fill="none" />
        <circle cx="14" cy="14" r="7" stroke="#2DD4BF" strokeWidth="2" fill="none" />
        <circle cx="14" cy="14" r="3" fill="#0F766E" />
      </svg>
      {showWordmark && (
        <span className="text-xl font-extrabold tracking-[-0.02em]">
          <span className="text-slate-900">Civic</span>
          <span className="text-teal-700">Relay</span>
        </span>
      )}
    </div>
  );
}
