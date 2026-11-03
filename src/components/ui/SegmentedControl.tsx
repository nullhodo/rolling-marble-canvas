interface Option<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <div
      className="grid gap-1 p-0.5 bg-white/60 rounded border border-gray-300/80"
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`py-1.5 rounded text-[11px] font-medium transition cursor-pointer ${
            option.value === value
              ? "bg-gray-900/90 text-white shadow-sm"
              : "text-gray-700 hover:bg-white/90"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
