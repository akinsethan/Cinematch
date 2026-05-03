import type { Filters, Genre, MaturityFilter } from "../../types/movie";

interface Mood {
  id: string;
  emoji: string;
  label: string;
  genres: Genre[];
  maturity: MaturityFilter;
}

const MOODS: Mood[] = [
  { id: "funny",      emoji: "😂", label: "Funny",        genres: ["Comedy"],                  maturity: "All"    },
  { id: "scary",      emoji: "😱", label: "Scary",        genres: ["Horror", "Thriller"],       maturity: "All"    },
  { id: "emotional",  emoji: "😢", label: "Emotional",    genres: ["Drama", "Romance"],         maturity: "All"    },
  { id: "epic",       emoji: "🚀", label: "Epic",         genres: ["Action", "Sci-Fi"],         maturity: "All"    },
  { id: "interesting",emoji: "🧠", label: "Interesting",  genres: ["Documentary"],              maturity: "All"    },
  { id: "family",     emoji: "🧸", label: "Family Night", genres: ["Animation"],                maturity: "Family" },
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
      // Deselect: clear only the fields this mood had set
      onChange({ genres: [], maturity: "All" });
    } else {
      onChange({ genres: mood.genres, maturity: mood.maturity });
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
        I&apos;m in the mood for…
      </p>
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map((mood) => {
          const active = activeMood?.id === mood.id;
          return (
            <button
              key={mood.id}
              onClick={() => handleClick(mood)}
              className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border text-center transition-all duration-150 cursor-pointer ${
                active
                  ? "bg-violet-600/20 border-violet-500 ring-1 ring-violet-500/50"
                  : "bg-gray-800/60 border-gray-700 hover:border-gray-500 hover:bg-gray-800"
              }`}
            >
              <span className="text-2xl leading-none">{mood.emoji}</span>
              <span
                className={`text-[11px] font-medium leading-tight ${
                  active ? "text-violet-300" : "text-gray-400"
                }`}
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
