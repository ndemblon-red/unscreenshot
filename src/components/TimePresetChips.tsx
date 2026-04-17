import { useState } from "react";

const TIME_PRESETS: { label: string; value: string }[] = [
  { label: "9 AM", value: "09:00" },
  { label: "12 PM", value: "12:00" },
  { label: "3 PM", value: "15:00" },
  { label: "6 PM", value: "18:00" },
  { label: "9 PM", value: "21:00" },
];

type Props = {
  value: string; // "HH:MM"
  onChange: (time: string) => void;
};

export default function TimePresetChips({ value, onChange }: Props) {
  const isPreset = TIME_PRESETS.some((p) => p.value === value);
  const [showCustom, setShowCustom] = useState(!isPreset);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {TIME_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => {
              onChange(p.value);
              setShowCustom(false);
            }}
            className={`px-3 py-1.5 rounded-pill text-[13px] font-medium transition-all ${
              value === p.value && !showCustom
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {p.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className={`px-3 py-1.5 rounded-pill text-[13px] font-medium transition-all ${
            showCustom || !isPreset
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Other
        </button>
      </div>
      {(showCustom || !isPreset) && (
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="self-start px-3 py-2 rounded-btn border border-border bg-card text-[15px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      )}
    </div>
  );
}
