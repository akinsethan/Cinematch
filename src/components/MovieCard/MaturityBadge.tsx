import type { MaturityRating } from "../../types/movie";

const STYLES: Record<MaturityRating, { bg: string; color: string; border: string }> = {
  Family: { bg: "#0a1a10", color: "#4a8b8c", border: "#1a4a2a" },
  Teen:   { bg: "#1a1500", color: "#d4a42a", border: "#3a3000" },
  Mature: { bg: "#1a0808", color: "#c0392b", border: "#3a1010" },
};

export function MaturityBadge({ maturity }: { maturity: MaturityRating }) {
  const s = STYLES[maturity];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-display uppercase tracking-widest border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {maturity}
    </span>
  );
}
