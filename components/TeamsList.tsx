"use client";

import { useEffect, useState } from "react";
import {
  fetchEspnTeam,
  fetchF1,
  fetchTournament,
  type FinishedGame,
  type TeamStatus,
  type Tournament,
  type UpcomingGame,
} from "@/lib/sports";

// ---------- formatting ----------

const HOUR = 3600_000;
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

/** Boston College: most relevant game across sports, each tagged with sport and that team's record. */
function bcView(statuses: { sport: string; s: TeamStatus }[]): View {
  const tag = (x: { sport: string; s: TeamStatus }) => (x.s.record ? `${x.sport} (${x.s.record})` : x.sport);
  const live = statuses.find((x) => x.s.live);
  const latest = statuses
    .filter((x) => x.s.last)
    .sort((a, b) => Date.parse(b.s.last!.date) - Date.parse(a.s.last!.date))[0];
  const soonest = statuses
    .filter((x) => x.s.next)
    .sort((a, b) => Date.parse(a.s.next!.date) - Date.parse(b.s.next!.date))[0];

  const nextLine = soonest ? `Next: ${tag(soonest)} · ${fmtNext(soonest.s.next!)}` : "No games scheduled";
  if (live) {
    const { us, them, detail } = live.s.live!;
    return { live: `${tag(live)} · ${us.abbr} ${us.score}–${them.score} ${them.abbr} · ${detail}`, lines: [nextLine] };
  }
  return {
    lines: [latest ? `Last: ${tag(latest)} · ${fmtLast(latest.s.last!)}` : "No recent games", nextLine],
  };
}

function tennisView(atp: Tournament | null, wta: Tournament | null): View {
  const now = Date.now();
  const running = (t: Tournament) => Date.parse(t.start) <= now && (!t.end || now < Date.parse(t.end));
  const tours = [atp, wta].filter((t): t is Tournament => !!t);
  if (!tours.length) return { lines: ["Off-season"] };
  const live = tours.filter(running);
  const later = tours.filter((t) => !running(t));
  return {
    lines: [
      ...(live.length ? [`Now: ${live.map((t) => t.name).join(" · ")}`] : []),
      ...later.map((t) => `Next: ${t.name} · ${when(t.start, false)}`),
    ],
  };
}

// ---------- rows ----------

type RowDef = { name: string; league: string; load: () => Promise<View> };

const ROWS: RowDef[] = [
  {
    name: "Golden State Warriors",
    league: "NBA",
    load: async () => teamView(await fetchEspnTeam("basketball/nba", "gs")),
  },
  {
    name: "San Francisco 49ers",
    league: "NFL",
    load: async () => teamView(await fetchEspnTeam("football/nfl", "sf")),
  },
  {
    name: "Chelsea",
    league: "Premier League",
    load: async () => teamView(await fetchEspnTeam("soccer/eng.1", "363"), "match"),
  },
  {
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
    name: "Boston College",
    league: "Hockey · Football · Basketball",
    load: async () => {
      const sports = [
        ["Hockey", "hockey/mens-college-hockey"],
        ["Football", "football/college-football"],
        ["Basketball", "basketball/mens-college-basketball"],
      ] as const;
      const results = await Promise.all(
        sports.map(([sport, path]) =>
          fetchEspnTeam(path, "103")
            .then((s) => ({ sport, s }))
            .catch(() => null)
        )
      );
      const ok = results.filter((r): r is NonNullable<typeof r> => r !== null);
      if (!ok.length) throw new Error("BC unavailable");
      return bcView(ok);
    },
  },
  {
    name: "Tennis",
    league: "ATP · WTA",
    load: async () => {
      const [atp, wta] = await Promise.all([
        fetchTournament("atp").catch(() => null),
        fetchTournament("wta").catch(() => null),
      ]);
      return tennisView(atp, wta);
    },
  },
];

// ---------- component ----------

export default function TeamsList() {
  const [views, setViews] = useState<(View | null)[]>(() => ROWS.map(() => null));
  const [failed, setFailed] = useState<boolean[]>(() => ROWS.map(() => false));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;

    async function refresh() {
      clearTimeout(timer);
      const results = await Promise.all(
        ROWS.map((r) =>
          r.load().catch((err) => {
            console.warn(`[teams] ${r.name}:`, err);
            return null;
          })
        )
      );
      if (stopped) return;
      // Keep the last good value for any row whose request failed.
      setViews((prev) => results.map((v, i) => v ?? prev[i]));
      setFailed(results.map((v) => v === null));
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
      {ROWS.map((row, i) => {
        const v = views[i];
        return (
          <div
            key={row.name}
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
                : <span>{failed[i] ? "Unavailable right now" : "Loading…"}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}
