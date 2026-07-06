type TagChipProps = {
  label: string;
};

export function TagChip({ label }: TagChipProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-teal-300 px-2.5 py-1 text-xs font-medium text-teal-700">
      AI · {label}
    </span>
  );
}
