import type { Filters, Genre, MaturityFilter } from "../../types/movie";

interface Mood {
  id: string;
  emoji: string;
  label: string;
  genres: Genre[];
  maturity: MaturityFilter;
  color: string;
}

const MOODS: Mood[] = [
  { id: "funny",       emoji: "😂", label: "Funny",        genres: ["Comedy"],             maturity: "All",    color: "#d4a42a" },
  { id: "scary",       emoji: "😱", label: "Scary",        genres: ["Horror", "Thriller"], maturity: "All",    color: "#c0392b" },
  { id: "emotional",   emoji: "😢", label: "Emotional",    genres: ["Drama", "Romance"],   maturity: "All",    color: "#b5336a" },
  { id: "epic",        emoji: "🚀", label: "Epic",         genres: ["Action", "Sci-Fi"],   maturity: "All",    color: "#e06830" },
  { id: "interesting", emoji: "🧠", label: "Interesting",  genres: ["Documentary"],        maturity: "All",    color: "#4a8b8c" },
  { id: "family",      emoji: "🧸", label: "Family Night", genres: ["Animation"],          maturity: "Family", color: "#4a8b8c" },
];

function isMoodActive(mood: Mood, filters: Filters): boolean {
  if (filters.maturity !== mood.maturity) return false;
  if (filters.genres.length !== mood.genres.length) return false;
  return mood.genres.every((g) => filters.genres.includes(g));
}

interface Props {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
}

export function MoodSelector({ filters, onChange }: Props) {
  const activeMood = MOODS.find((m) => isMoodActive(m, filters)) ?? null;

  function handleClick(mood: Mood) {
    if (activeMood?.id === mood.id) {
      onChange({ genres: [], maturity: "All" });
    } else {
      onChange({ genres: mood.genres, maturity: mood.maturity });
    }
  }

  return (
    <div>
      <p className="font-display text-xs uppercase tracking-widest mb-3" style={{ color: "#6b6458" }}>
        I&apos;m In The Mood For…
      </p>
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map((mood) => {
          const active = activeMood?.id === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => handleClick(mood)}
              className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all duration-150 cursor-pointer"
              style={{
                background: active ? `${mood.color}18` : "#1a1a1a",
                borderColor: active ? mood.color : "#2a2a2a",
                boxShadow: active ? `0 0 0 1px ${mood.color}60` : "none",
              }}
            >
              <span className="text-2xl leading-none">{mood.emoji}</span>
              <span
                className="text-[10px] font-display uppercase tracking-wide leading-tight"
                style={{ color: active ? mood.color : "#6b6458" }}
              >
                {mood.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
