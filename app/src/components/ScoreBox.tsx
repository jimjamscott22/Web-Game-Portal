interface ScoreBoxProps {
  label: string;
  value: number;
  bgColor?: string;
  textColor?: string;
}

export default function ScoreBox({
  label,
  value,
  bgColor = '#FCB630',
  textColor = '#151515',
}: ScoreBoxProps) {
  return (
    <div
      className="rounded-tile border-[3px] border-dark px-4 py-2 min-w-[80px] text-center"
      style={{ backgroundColor: bgColor }}
    >
      <div className="font-body text-[10px] font-medium uppercase tracking-wider" style={{ color: textColor, opacity: 0.7 }}>
        {label}
      </div>
      <div className="font-pixel text-2xl font-bold" style={{ color: textColor }}>
        {value}
      </div>
    </div>
  );
}
