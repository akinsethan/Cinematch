import type { MouseEvent } from "react";

interface Props {
  inWatchlist: boolean;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
}

export function WatchlistButton({ inWatchlist, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
        inWatchlist
          ? "bg-violet-600 text-white"
          : "bg-black/60 text-gray-300 hover:bg-violet-600 hover:text-white"
      }`}
    >
      {inWatchlist ? (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
    </button>
  );
}
