import { useState, useEffect, useRef } from "react";
import { getWatchProviders, type WatchProvider } from "../../api/tmdb";

const LOGO_BASE = "https://image.tmdb.org/t/p/w45";

interface Props { movieId: number; }

export function StreamingBadges({ movieId }: Props) {
  const [providers, setProviders] = useState<WatchProvider[] | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    getWatchProviders(movieId).then(setProviders).catch(() => setProviders([]));
  }, [movieId]);

  if (providers === null) {
    return (
      <div className="flex items-center gap-1.5 px-3 pb-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="w-6 h-6 rounded animate-pulse" style={{ background: "#2a2a2a" }} />
        ))}
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className="px-3 pb-3 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ color: "#3a3028" }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <span className="text-xs" style={{ color: "#3a3028" }}>Not streaming</span>
      </div>
    );
  }

  return (
    <div className="px-3 pb-3">
      <p className="text-[10px] font-display uppercase tracking-widest mb-1.5" style={{ color: "#3a3028" }}>
        Stream On
      </p>
      <div className="flex flex-wrap gap-1.5">
        {providers.map((p) => (
          <img key={p.provider_id} src={`${LOGO_BASE}${p.logo_path}`}
            alt={p.provider_name} title={p.provider_name}
            className="w-7 h-7 rounded-md object-cover" loading="lazy" />
        ))}
      </div>
    </div>
  );
}
