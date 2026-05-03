import type { Genre } from "../../types/movie";
import { GENRE_LIST } from "../../types/movie";

interface Props {
  selected: Genre[];
  onChange: (genres: Genre[]) => void;
}

export function GenreMultiSelect({ selected, onChange }: Props) {
  const toggle = (genre: Genre) => {
    onChange(selected.includes(genre)
      ? selected.filter((g) => g !== genre)
      : [...selected, genre]);
  };

  return (
    <div>
      <p className="font-display text-xs uppercase tracking-widest mb-2" style={{ color: "#6b6458" }}>
        Genres
      </p>
      <div className="flex flex-wrap gap-2">
        {GENRE_LIST.map((genre) => {
          const active = selected.includes(genre);
          return (
            <button
              key={genre}
              onClick={() => toggle(genre)}
              className="px-3 py-1 rounded-full text-xs font-display uppercase tracking-wide border transition-all cursor-pointer"
              style={{
                background: active ? "#4a8b8c" : "#1a1a1a",
                borderColor: active ? "#4a8b8c" : "#2a2a2a",
                color: active ? "#0a0a0a" : "#6b6458",
              }}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
