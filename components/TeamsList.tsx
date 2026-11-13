"use client";

import { useEffect, useState } from "react";
import { fetchNextUp, fetchCurrentTournament, fetchF1NextRace, type NextUp } from "@/lib/sports";

function shortDate(iso: string) {
  // F1 dates are plain "YYYY-MM-DD"; parse as local noon so the day doesn't shift.
  const d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
}

function formatNextUp(n: NextUp | null) {
  if (!n) return null;
  return `Next: ${n.isHome ? "vs" : "at"} ${n.opponent} · ${shortDate(n.date)}`;
}

const settle = <T,>(p: Promise<T>) => p.catch(() => null);

type Row = { name: string; league: string; status: string };

const initialRows: Row[] = [
  { name: "Golden State Warriors", league: "NBA", status: "Next: …" },
  { name: "San Francisco 49ers", league: "NFL", status: "Next: …" },
  { name: "Chelsea", league: "Premier League", status: "Next: …" },
  { name: "Ferrari & Williams", league: "F1", status: "Next: …" },
  { name: "Boston College", league: "Hockey · Football · Basketball", status: "Next: …" },
  { name: "Tennis", league: "ATP · WTA", status: "Now: …" },
];

export default function TeamsList() {
  const [rows, setRows] = useState(initialRows);

  useEffect(() => {
    let cancelled = false;
    const set = (i: number, status: string) => {
      if (cancelled) return;
      setRows((prev) => prev.map((r, j) => (j === i ? { ...r, status } : r)));
    };

    settle(fetchNextUp("basketball/nba/teams/gs")).then((n) => set(0, formatNextUp(n) ?? "No game scheduled"));
    settle(fetchNextUp("football/nfl/teams/sf")).then((n) => set(1, formatNextUp(n) ?? "No game scheduled"));
    settle(fetchNextUp("soccer/eng.1/teams/363")).then((n) => set(2, formatNextUp(n) ?? "No match scheduled"));
    settle(fetchF1NextRace()).then((r) =>
      set(3, r ? `Next: ${r.raceName} · ${shortDate(r.date)}` : "Season over")
    );

    const bcSports = [
      ["Hockey", "hockey/mens-college-hockey/teams/103"],
      ["Football", "football/college-football/teams/103"],
      ["Basketball", "basketball/mens-college-basketball/teams/103"],
    ] as const;
    Promise.all(bcSports.map(([, path]) => settle(fetchNextUp(path)))).then((results) => {
      const soonest = results
        .map((n, i) => (n ? { sport: bcSports[i][0], ...n } : null))
        .filter((n): n is NonNullable<typeof n> => n !== null)
        .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))[0];
      set(
        4,
        soonest
          ? `Next: ${soonest.sport} · ${soonest.isHome ? "vs" : "at"} ${soonest.opponent} ·${shortDate(soonest.date)}`
          : "No game scheduled"
      );
    });

    Promise.all([settle(fetchCurrentTournament("atp")), settle(fetchCurrentTournament("wta"))]).then(
      ([atp, wta]) => {
        const names = [...new Set([atp, wta].filter((x): x is string => !!x))];
        set(5, names.length ? `Now: ${names.join(" · ")}` : "Off-season");
      }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col border-t border-rule-soft">
      {rows.map((r) => (
        <div
          key={r.name}
          className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-3.5 border-b border-rule-soft"
        >
          <span>
            {r.name} <span className="text-label">{r.league}</span>
          </span>
          <span className="text-muted">{r.status}</span>
        </div>
      ))}
    </div>
  );
}
