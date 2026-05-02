import type { Genre } from "../../types/movie";
import { GENRE_LIST } from "../../types/movie";

interface Props {
  selected: Genre[];
  onChange: (genres: Genre[]) => void;
}

export function GenreMultiSelect({ selected, onChange }: Props) {
  const toggle = (genre: Genre) => {
    if (selected.includes(genre)) {
      onChange(selected.filter((g) => g !== genre));
    } else {
      onChange([...selected, genre]);
    }
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
        Genres
      </p>
      <div className="flex flex-wrap gap-2">
        {GENRE_LIST.map((genre) => {
          const active = selected.includes(genre);
          return (
            <button
              key={genre}
              onClick={() => toggle(genre)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                active
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-300 hover:border-violet-500 hover:text-violet-300"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
