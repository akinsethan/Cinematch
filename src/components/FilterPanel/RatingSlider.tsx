interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function RatingSlider({ value, onChange }: Props) {
  const pct = (value / 9) * 100;
  return (
    <div>
      <p className="font-display text-xs uppercase tracking-widest mb-2" style={{ color: "#6b6458" }}>
        Min Rating{" "}
        <span className="normal-case tracking-normal font-bold" style={{ color: "#d4a42a" }}>
          {value > 0 ? `≥ ${value.toFixed(1)}` : "Any"}
        </span>
      </p>
      <input
        type="range"
        min={0}
        max={9}
        step={0.5}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, #d4a42a ${pct}%, #2a2a2a ${pct}%)`,
        }}
      />
      <div className="flex justify-between text-[10px] mt-1" style={{ color: "#3a3530" }}>
        <span>0</span>
        <span>4.5</span>
        <span>9</span>
      </div>
    </div>
  );
}
