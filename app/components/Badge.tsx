type BadgeProps = {
  label: string;
  color: string;
  bg: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function Badge({ label, color, bg, icon: Icon }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-wide" style={{ backgroundColor: bg, color }}>
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
