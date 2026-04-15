"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SeriesPoint = { match_number: number; cumulative: number };

type ManagerSeries = {
  team_id: number;
  team_name: string;
  owner_name: string;
  total_points: number;
  series: SeriesPoint[];
};

type ProgressionChartProps = {
  managers: ManagerSeries[];
  leaderTeamId: number | null;
  totalMatches: number;
};

// Palette tuned for dark theme — distinct, high contrast, colorblind-friendlyish.
const PALETTE = [
  "#fcd34d", // amber  (leader default)
  "#67e8f9", // cyan
  "#86efac", // green
  "#f472b6", // pink
  "#c4b5fd", // violet
  "#fb923c", // orange
  "#a5f3fc", // light cyan
  "#fda4af", // rose
  "#bef264", // lime
  "#f0abfc", // fuchsia
];

const MARGIN = { top: 24, right: 24, bottom: 36, left: 48 };

export function ProgressionChart({
  managers,
  leaderTeamId,
  totalMatches,
}: ProgressionChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(800);
  const height = 380;
  const [hoverMatch, setHoverMatch] = useState<number | null>(null);
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set());

  // Observe container width for responsive SVG
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setWidth(el.clientWidth);
    });
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const visibleManagers = useMemo(
    () => managers.filter((m) => !hiddenIds.has(m.team_id)),
    [managers, hiddenIds]
  );

  // Derive min/max across all managers (not just visible) so axis is stable
  const maxY = useMemo(() => {
    const all = managers.flatMap((m) => m.series.map((p) => p.cumulative));
    const max = all.length ? Math.max(...all) : 0;
    // round up to a nice ceiling (nearest 500 above max)
    return Math.max(500, Math.ceil(max / 500) * 500);
  }, [managers]);

  const minX = 1;
  const maxX = Math.max(totalMatches, 1);

  const innerW = Math.max(width - MARGIN.left - MARGIN.right, 0);
  const innerH = height - MARGIN.top - MARGIN.bottom;

  const xScale = (n: number) =>
    MARGIN.left + ((n - minX) / Math.max(maxX - minX, 1)) * innerW;
  const yScale = (v: number) =>
    MARGIN.top + innerH - (v / Math.max(maxY, 1)) * innerH;

  // Y-axis ticks — 5 steps
  const yTicks = useMemo(() => {
    const steps = 5;
    return Array.from({ length: steps + 1 }, (_, i) =>
      Math.round((maxY / steps) * i)
    );
  }, [maxY]);

  // X-axis ticks — aim for ~10 labels
  const xTicks = useMemo(() => {
    const desired = 10;
    const step = Math.max(1, Math.round(maxX / desired));
    const ticks: number[] = [];
    for (let i = minX; i <= maxX; i += step) ticks.push(i);
    if (ticks[ticks.length - 1] !== maxX) ticks.push(maxX);
    return ticks;
  }, [maxX]);

  const managerColor = (manager: ManagerSeries, idx: number) => {
    if (manager.team_id === leaderTeamId) return PALETTE[0];
    // Offset by 1 because leader takes PALETTE[0]
    return PALETTE[(idx + 1) % PALETTE.length];
  };

  const buildPath = (series: SeriesPoint[]) => {
    if (!series.length) return "";
    return series
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${xScale(p.match_number).toFixed(2)} ${yScale(
            p.cumulative
          ).toFixed(2)}`
      )
      .join(" ");
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;

    if (x < MARGIN.left || x > MARGIN.left + innerW) {
      setHoverMatch(null);
      return;
    }

    const ratio = (x - MARGIN.left) / innerW;
    const raw = minX + ratio * (maxX - minX);
    const rounded = Math.max(minX, Math.min(maxX, Math.round(raw)));
    setHoverMatch(rounded);
  };

  const toggleManager = (teamId: number) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  // Hover values at the current match
  const hoverValues = useMemo(() => {
    if (hoverMatch == null) return [];
    return visibleManagers
      .map((m) => {
        const point =
          m.series.find((p) => p.match_number === hoverMatch) ??
          // If no point at exact match, carry forward the latest earlier value
          [...m.series].reverse().find((p) => p.match_number <= hoverMatch);
        return {
          manager: m,
          value: point?.cumulative ?? 0,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [hoverMatch, visibleManagers]);

  if (!managers.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center text-sm text-stone-400">
        No match data yet. Once matches are scored, the progression chart will
        appear here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-2"
        style={{ height }}
      >
        <svg
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverMatch(null)}
          className="block"
        >
          {/* Y gridlines */}
          {yTicks.map((tick) => (
            <g key={`y-${tick}`}>
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + innerW}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="2 4"
              />
              <text
                x={MARGIN.left - 8}
                y={yScale(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fill="rgba(231,229,228,0.5)"
              >
                {tick.toLocaleString()}
              </text>
            </g>
          ))}

          {/* X tick labels */}
          {xTicks.map((tick) => (
            <g key={`x-${tick}`}>
              <line
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={MARGIN.top + innerH}
                y2={MARGIN.top + innerH + 4}
                stroke="rgba(255,255,255,0.2)"
              />
              <text
                x={xScale(tick)}
                y={MARGIN.top + innerH + 18}
                textAnchor="middle"
                fontSize={11}
                fill="rgba(231,229,228,0.5)"
              >
                {tick}
              </text>
            </g>
          ))}

          {/* Axis labels */}
          <text
            x={MARGIN.left + innerW / 2}
            y={height - 4}
            textAnchor="middle"
            fontSize={11}
            fill="rgba(231,229,228,0.4)"
            letterSpacing="0.14em"
          >
            MATCH NUMBER
          </text>
          <text
            x={14}
            y={MARGIN.top + innerH / 2}
            textAnchor="middle"
            fontSize={11}
            fill="rgba(231,229,228,0.4)"
            letterSpacing="0.14em"
            transform={`rotate(-90, 14, ${MARGIN.top + innerH / 2})`}
          >
            FANTASY POINTS
          </text>

          {/* Hover crosshair */}
          {hoverMatch != null && (
            <line
              x1={xScale(hoverMatch)}
              x2={xScale(hoverMatch)}
              y1={MARGIN.top}
              y2={MARGIN.top + innerH}
              stroke="rgba(255,255,255,0.25)"
              strokeDasharray="3 3"
            />
          )}

          {/* Lines — non-leader first so leader renders on top */}
          {visibleManagers
            .slice()
            .sort((a, b) => {
              if (a.team_id === leaderTeamId) return 1;
              if (b.team_id === leaderTeamId) return -1;
              return 0;
            })
            .map((m) => {
              const managerIdx = managers.findIndex(
                (x) => x.team_id === m.team_id
              );
              const color = managerColor(m, managerIdx);
              const isLeader = m.team_id === leaderTeamId;

              return (
                <path
                  key={m.team_id}
                  d={buildPath(m.series)}
                  fill="none"
                  stroke={color}
                  strokeWidth={isLeader ? 3 : 1.75}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={isLeader ? 1 : 0.85}
                />
              );
            })}

          {/* Hover dots */}
          {hoverMatch != null &&
            hoverValues.map(({ manager, value }) => {
              const idx = managers.findIndex(
                (x) => x.team_id === manager.team_id
              );
              const color = managerColor(manager, idx);
              return (
                <circle
                  key={`dot-${manager.team_id}`}
                  cx={xScale(hoverMatch)}
                  cy={yScale(value)}
                  r={4}
                  fill={color}
                  stroke="rgba(0,0,0,0.6)"
                  strokeWidth={1}
                />
              );
            })}
        </svg>

        {/* Hover tooltip */}
        {hoverMatch != null && hoverValues.length > 0 && (
          <div
            className="pointer-events-none absolute top-3 max-w-[240px] rounded-xl border border-white/10 bg-black/80 p-3 text-xs text-stone-200 shadow-lg backdrop-blur"
            style={{
              left: Math.min(
                Math.max(xScale(hoverMatch) + 12, 8),
                Math.max(width - 240, 8)
              ),
            }}
          >
            <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-stone-500">
              After match {hoverMatch}
            </div>
            <div className="space-y-1.5">
              {hoverValues.map(({ manager, value }) => {
                const idx = managers.findIndex(
                  (x) => x.team_id === manager.team_id
                );
                const color = managerColor(manager, idx);
                return (
                  <div
                    key={manager.team_id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate text-stone-300">
                        {manager.owner_name}
                      </span>
                    </div>
                    <span className="font-semibold text-stone-50 tabular-nums">
                      {value.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {managers.map((manager, idx) => {
          const color = managerColor(manager, idx);
          const hidden = hiddenIds.has(manager.team_id);
          const isLeader = manager.team_id === leaderTeamId;

          return (
            <button
              key={manager.team_id}
              type="button"
              onClick={() => toggleManager(manager.team_id)}
              className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                hidden
                  ? "border-white/5 bg-white/[0.02] text-stone-500"
                  : "border-white/10 bg-white/[0.04] text-stone-200 hover:bg-white/[0.08]"
              }`}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: hidden ? "transparent" : color,
                  border: hidden ? `1px solid ${color}` : "none",
                }}
              />
              <span className={hidden ? "line-through" : ""}>
                {manager.owner_name}
              </span>
              {isLeader && !hidden && (
                <span className="text-[10px] uppercase tracking-[0.16em] text-amber-200">
                  Leader
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
