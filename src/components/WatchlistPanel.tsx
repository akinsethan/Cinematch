import { useState } from "react";
import type { ScoredMovie } from "../types/movie";
import { POSTER_BASE_URL } from "../api/tmdb";

interface Props {
  watchlist: ScoredMovie[];
  onRemove: (id: number) => void;
}

export function WatchlistPanel({ watchlist, onRemove }: Props) {
  const [open, setOpen] = useState(false);

  if (watchlist.length === 0) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-violet-600 hover:bg-violet-500 text-white rounded-full px-4 py-3 font-semibold shadow-xl transition-colors flex items-center gap-2 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
        Watchlist
        <span className="bg-white/20 rounded-full px-1.5 py-0.5 text-xs font-bold">
          {watchlist.length}
        </span>
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm bg-gray-900 border-l border-gray-800 h-full flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <h2 className="text-white font-bold text-lg">
                Watchlist ({watchlist.length})
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-800">
              {watchlist.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-14 bg-gray-800 rounded overflow-hidden shrink-0">
                    {m.poster_path ? (
                      <img
                        src={`${POSTER_BASE_URL}${m.poster_path}`}
                        alt={m.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg">🎬</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{m.title}</p>
                    <p className="text-xs text-gray-400">{m.release_year} · ★ {m.rating.toFixed(1)}</p>
                  </div>
                  <button
                    onClick={() => onRemove(m.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
