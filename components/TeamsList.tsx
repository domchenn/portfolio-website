"use client";

import { useEffect, useState } from "react";
import {
  fetchEspnTeam,
  fetchF1,
  fetchTour,
  type FinishedGame,
  type TeamStatus,
  type TourStatus,
  type UpcomingGame,
} from "@/lib/sports";

// ---------- formatting ----------

const LIVE_REFRESH = 30_000; // while any game is in progress
const IDLE_REFRESH = 10 * 60_000; // otherwise

function when(iso: string, withTime = true) {
  const opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
  if (withTime) Object.assign(opts, { hour: "numeric", minute: "2-digit" });
  return new Date(iso).toLocaleString("en-US", opts);
}

const fmtLast = (g: FinishedGame) =>
  `${g.result} ${g.us.score}–${g.them.score} ${g.isHome ? "vs" : "at"} ${g.them.abbr}`;
const fmtNext = (g: UpcomingGame) => `${g.isHome ? "vs" : "at"} ${g.opponent} · ${when(g.date)}`;

/** `live` is the in-progress score (shown first, highlighted); `lines` follow it. */
type View = { live?: string; lines: string[]; record?: string };

/** Not live: last game + next game (record sits beside the league). Live: score + next game. */
function teamView(s: TeamStatus, noun = "game"): View {
  const next = s.next ? `Next: ${fmtNext(s.next)}` : `No ${noun} scheduled`;
  if (s.live) {
    const { us, them, detail } = s.live;
    return { live: `${us.abbr} ${us.score}–${them.score} ${them.abbr} · ${detail}`, lines: [next], record: s.record };
  }
  return { lines: [s.last ? `Last: ${fmtLast(s.last)}` : `No recent ${noun}`, next], record: s.record };
}

/** One line per tour ("ATP: …"), plus the next event when the current one is wrapping up. */
function tennisView(tours: { label: string; t: TourStatus | null }[]): View {
  const now = Date.now();
  const lines: string[] = [];
  for (const { label, t } of tours) {
    if (!t?.current) continue;
    const c = t.current;
    const started = Date.parse(c.start) <= now;
    const over = c.end ? now >= Date.parse(c.end) : false;
    if (started && !over) lines.push(`${label}: ${c.name}`);
    else if (!started) lines.push(`${label}: ${c.name} · starts ${when(c.start, false)}`);
    if (t.next) lines.push(`${label} next: ${t.next.name} · ${when(t.next.start, false)}`);
  }
  return { lines: lines.length ? lines : ["Off-season"] };
}

// ---------- rows ----------

type RowDef = { id: string; name: string; league: string; load: () => Promise<View> };

const ROWS: RowDef[] = [
  {
    id: "gsw",
    name: "Golden State Warriors",
    league: "NBA",
    load: async () => teamView(await fetchEspnTeam("basketball/nba", "gs")),
  },
  {
    id: "sf",
    name: "San Francisco 49ers",
    league: "NFL",
    load: async () => teamView(await fetchEspnTeam("football/nfl", "sf")),
  },
  {
    id: "chelsea",
    name: "Chelsea",
    league: "Premier League",
    load: async () => teamView(await fetchEspnTeam("soccer/eng.1", "363"), "match"),
  },
  {
    id: "bc-football",
    name: "Boston College",
    league: "Football",
    load: async () => teamView(await fetchEspnTeam("football/college-football", "103")),
  },
  {
    id: "bc-basketball",
    name: "Boston College",
    league: "Basketball",
    load: async () => teamView(await fetchEspnTeam("basketball/mens-college-basketball", "103")),
  },
  {
    id: "bc-hockey",
    name: "Boston College",
    league: "Hockey",
    load: async () => teamView(await fetchEspnTeam("hockey/mens-college-hockey", "103")),
  },
  {
    id: "f1",
    name: "Ferrari & Williams",
    league: "F1",
    load: async () => {
      const f = await fetchF1();
      const lines: string[] = [];
      if (f.lastRace) lines.push(`Last: ${f.lastRace.name} · won by ${f.lastRace.winner}`);
      lines.push(f.nextRace ? `Next: ${f.nextRace.name} · ${when(f.nextRace.date)}` : "Season over");
      const drivers = f.drivers.map((d) => `${d.code} P${d.position}`).join(" · ");
      // Driver standings play the role of the "record" for F1.
      return { lines, record: drivers || undefined };
    },
  },
  {
    id: "tennis",
    name: "Tennis",
    league: "ATP · WTA",
    load: async () => {
      const [atp, wta] = await Promise.all([
        fetchTour("atp").catch(() => null),
        fetchTour("wta").catch(() => null),
      ]);
      if (!atp && !wta) throw new Error("tennis unavailable");
      return tennisView([
        { label: "ATP", t: atp },
        { label: "WTA", t: wta },
      ]);
    },
  },
];

// ---------- component ----------

export default function TeamsList() {
  // Keyed by row id (not position) so adding/reordering rows can't show one team's data on another.
  const [views, setViews] = useState<Record<string, View>>({});
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    async function refresh() {
      clearTimeout(timer);
      const results = await Promise.all(
        ROWS.map((r) =>
          r.load().catch((err) => {
            console.warn(`[teams] ${r.name} ${r.league}:`, err);
            return null;
          })
        )
      );
      if (stopped) return;
      // Keep the last good value for any row whose request failed.
      setViews((prev) => {
        const nextViews = { ...prev };
        results.forEach((v, i) => {
          if (v) nextViews[ROWS[i].id] = v;
        });
        return nextViews;
      });
      setFailed(Object.fromEntries(results.map((v, i) => [ROWS[i].id, v === null])));
      if (!document.hidden) {
        timer = setTimeout(refresh, results.some((v) => v?.live) ? LIVE_REFRESH : IDLE_REFRESH);
      }
    }

    function onVisibility() {
      if (document.hidden) clearTimeout(timer);
      else refresh();
    }

    refresh();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="flex flex-col border-t border-rule-soft">
      {ROWS.map((row) => {
        const v = views[row.id];
        return (
          <div
            key={row.id}
            className="flex flex-wrap justify-between items-baseline gap-x-6 gap-y-1 py-3.5 border-b border-rule-soft"
          >
            <span className="flex flex-col">
              <span>
                {row.name} <span className="text-label">{row.league}</span>
              </span>
              {v?.record && <span className="text-[15px] text-label tabular-nums">{v.record}</span>}
            </span>
            <span className="flex flex-col sm:items-end sm:text-right text-muted">
              {v?.live && (
                <span className="text-fg">
                  <span
                    aria-hidden="true"
                    className="inline-block w-1.5 h-1.5 rounded-full bg-[#E5484D] animate-pulse mr-2 align-middle"
                  />
                  <span className="sr-only">Live: </span>
                  {v.live}
                </span>
              )}
              {v
                ? v.lines.map((line, j) => <span key={j}>{line}</span>)
                : <span>{failed[row.id] ? "Unavailable right now" : "Loading…"}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
