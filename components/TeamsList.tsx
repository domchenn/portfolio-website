"use client";

import { useEffect, useState } from "react";
import {
  fetchEspnTeam,
  fetchF1,
  type F1Status,
  type FinishedGame,
  type TeamStatus,
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

/** `live` is the in-progress score (shown first, highlighted); `items` are labeled lines below it. */
type Item = { label: string; value: string };
type View = { live?: string; items: Item[]; record?: string };

/** Not live: last game + next game. Live: score + next game. Record shows under the team name. */
function teamView(s: TeamStatus, noun = "game"): View {
  const next: Item = { label: "Next", value: s.next ? fmtNext(s.next) : `No ${noun} scheduled` };
  if (s.live) {
    const { us, them, detail } = s.live;
    return { live: `${us.abbr} ${us.score}–${them.score} ${them.abbr} · ${detail}`, items: [next], record: s.record };
  }
  const last: Item = { label: "Last", value: s.last ? fmtLast(s.last) : `No recent ${noun}` };
  return { items: [last, next], record: s.record };
}

// ---------- F1 ----------

const F1_TEAMS = ["ferrari", "williams"];
const shortRace = (name: string) => name.replace(/Grand Prix$/, "GP");

// Both F1 cards share one fetch per refresh.
let f1Cache: { at: number; promise: Promise<F1Status> } | null = null;
function getF1() {
  if (!f1Cache || Date.now() - f1Cache.at > 15_000) {
    f1Cache = { at: Date.now(), promise: fetchF1(F1_TEAMS) };
    f1Cache.promise.catch(() => (f1Cache = null));
  }
  return f1Cache.promise;
}

function f1Row(id: string, name: string): RowDef {
  return {
    id: `f1-${id}`,
    name,
    league: "F1",
    load: async () => {
      const f = await getF1();
      const team = f.teams[id];
      const items: Item[] = [];
      if (team?.drivers.length) {
        items.push({ label: "Drivers", value: team.drivers.map((d) => `${d.code} P${d.position}`).join(" · ") });
      }
      if (f.lastRace) {
        const finishes = team?.lastFinishes.map((r) => `${r.code} ${r.result}`).join(", ");
        items.push({ label: "Last", value: `${shortRace(f.lastRace.name)}${finishes ? ` · ${finishes}` : ""}` });
      }
      items.push({
        label: "Next",
        value: f.nextRace ? `${shortRace(f.nextRace.name)} · ${when(f.nextRace.date)}` : "Season over",
      });
      const record = team?.standing ? `P${team.standing.position} · ${team.standing.points} pts` : undefined;
      return { items, record };
    },
  };
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
  f1Row("ferrari", "Ferrari"),
  f1Row("williams", "Williams"),
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
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
      {ROWS.map((row) => {
        const v = views[row.id];
        return (
          <article
            key={row.id}
            className={`flex flex-col gap-4 rounded-lg border p-4 ${v?.live ? "border-[#4A2A2C]" : "border-rule"}`}
          >
            <header className="flex flex-col">
              <span className="text-[15px] text-label">{row.league}</span>
              <h3 className="m-0 text-[17px] font-medium leading-snug">{row.name}</h3>
              {v?.record && <span className="text-[15px] text-muted tabular-nums">{v.record}</span>}
            </header>

            {v?.live && (
              <p className="m-0 text-fg">
                <span
                  aria-hidden="true"
                  className="inline-block w-1.5 h-1.5 rounded-full bg-[#E5484D] animate-pulse mr-2 align-middle"
                />
                <span className="sr-only">Live: </span>
                {v.live}
              </p>
            )}

            {v ? (
              <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[15px] leading-snug">
                {v.items.map((item) => (
                  <div key={item.label} className="contents">
                    <dt className="text-label">{item.label}</dt>
                    <dd className="m-0 text-muted">{item.value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="m-0 text-[15px] text-label">
                {failed[row.id] ? "Unavailable right now" : "Loading…"}
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
