export interface DifficultyOption<T extends string> { value: T; label: string }

export default function DifficultyPills<T extends string>({
  options,
  value,
  onChange,
  color,
}: {
  options: DifficultyOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** The game's hue token; the selected pill is a 26% wash of it. */
  color: string;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2" aria-label="Difficulty">
      {options.map(option => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            aria-pressed={selected}
            className={`min-h-11 px-4 rounded-pill font-body text-sm transition-colors ${
              selected ? 'font-semibold text-ink' : 'border border-line text-muted-foreground hover:bg-panel'
            }`}
            style={selected ? { background: `color-mix(in srgb, ${color} 26%, transparent)` } : undefined}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
