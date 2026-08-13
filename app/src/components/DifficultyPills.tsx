export interface DifficultyOption<T extends string> { value: T; label: string }
export default function DifficultyPills<T extends string>({ options, value, onChange, color }: { options: DifficultyOption<T>[]; value: T; onChange: (value: T) => void; color: string }) {
  return <div className="flex flex-wrap justify-center gap-2" aria-label="Difficulty">{options.map(option => <button key={option.value} onClick={() => onChange(option.value)} className={`min-h-11 px-3 rounded-full border-[2px] border-dark font-pixel text-sm transition-colors ${value === option.value ? 'text-white' : 'bg-white text-dark'}`} style={value === option.value ? { backgroundColor: color } : undefined} aria-pressed={value === option.value}>{option.label}</button>)}</div>;
}
