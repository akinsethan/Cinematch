interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function RatingSlider({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Min Rating{" "}
        <span className="text-violet-400 font-bold normal-case tracking-normal">
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
        className="w-full h-2 rounded-full accent-violet-500 cursor-pointer"
        style={{ background: `linear-gradient(to right, #7c3aed ${(value / 9) * 100}%, #374151 ${(value / 9) * 100}%)` }}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0</span>
        <span>4.5</span>
        <span>9</span>
      </div>
    </div>
  );
}
