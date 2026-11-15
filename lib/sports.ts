// Live sports data for the "Teams I follow" list.
// Sources (free, no keys, CORS-enabled): ESPN's public site API and Jolpica (Ergast) for F1.
// Every fetcher resolves to a TeamStatus; the UI decides what to show (live → recent → next).

const ESPN = "https://site.api.espn.com/apis/site/v2/sports";
const F1 = "https://api.jolpi.ca/ergast/f1/current";

export type Side = { abbr: string; score: string };

export type LiveGame = { us: Side; them: Side; detail: string };
export type FinishedGame = {
  result: "W" | "L" | "D";
  us: Side;
  them: Side;
  isHome: boolean;
  date: string;
};
export type UpcomingGame = { opponent: string; isHome: boolean; date: string };

export type TeamStatus = {
  live?: LiveGame;
  last?: FinishedGame;
  next?: UpcomingGame;
  record?: string;
};

// ---------- ESPN team sports ----------

type EspnTeamRef = {
  id: string;
  abbreviation?: string;
  displayName: string;
  shortDisplayName?: string;
};

type EspnCompetitor = {
  homeAway: "home" | "away";
  winner?: boolean;
  team: EspnTeamRef;
  score?: string | { displayValue: string };
};

type EspnEvent = {
  id: string;
  date: string;
  competitions: {
    status: { type: { state: "pre" | "in" | "post"; completed: boolean; shortDetail: string } };
    competitors: EspnCompetitor[];
  }[];
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

const scoreOf = (c: EspnCompetitor) =>
  typeof c.score === "string" ? c.score : (c.score?.displayValue ?? "");
const abbrOf = (t: EspnTeamRef) => t.abbreviation ?? t.shortDisplayName ?? t.displayName;
const nameOf = (t: EspnTeamRef) => t.shortDisplayName ?? t.displayName;

function split(event: EspnEvent, teamId: string) {
  const comp = event.competitions[0];
  const us = comp?.competitors.find((c) => c.team.id === teamId);
  const them = comp?.competitors.find((c) => c.team.id !== teamId);
  return us && them ? { comp, us, them } : null;
}

type EspnSchedule = {
  team?: { id: string; recordSummary?: string };
  events?: EspnEvent[];
};

/**
 * Status for one ESPN team, built only from the team schedule endpoint
 * (the plain /teams/{id} endpoint doesn't send CORS headers, so browsers block it).
 * @param path e.g. "basketball/nba" — sport/league
 * @param team ESPN slug or numeric id, e.g. "gs" or "103"
 */
export async function fetchEspnTeam(path: string, team: string): Promise<TeamStatus> {
  const base = `${ESPN}/${path}/teams/${team}/schedule`;
  // Soccer schedules list results only; upcoming matches need ?fixture=true.
  const isSoccer = path.startsWith("soccer/");
  const [results, fixtures] = await Promise.all([
    getJson<EspnSchedule>(base),
    isSoccer ? getJson<EspnSchedule>(`${base}?fixture=true`).catch(() => ({ events: [] })) : null,
  ]);

  const id = results.team?.id ?? team;
  const record = results.team?.recordSummary;
  const seen = new Set<string>();
  const events = [...(results.events ?? []), ...(fixtures?.events ?? [])].filter((e) =>
    seen.has(e.id) ? false : (seen.add(e.id), true)
  );
  const state = (e: EspnEvent) => e.competitions[0]?.status.type.state;

  // Most recent finished game (ESPN orders soccer newest-first, others oldest-first — sort to be safe).
  const finished = events
    .filter((e) => e.competitions[0]?.status.type.completed)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))[0];
  let last: FinishedGame | undefined;
  const f = finished && split(finished, id);
  if (f) {
    const result = f.us.winner ? "W" : f.them.winner ? "L" : "D";
    last = {
      result,
      us: { abbr: abbrOf(f.us.team), score: scoreOf(f.us) },
      them: { abbr: abbrOf(f.them.team), score: scoreOf(f.them) },
      isHome: f.us.homeAway === "home",
      date: finished.date,
    };
  }

  // In-progress game: the schedule flags it but omits the score, so read the game summary.
  const liveEvent = events.find((e) => state(e) === "in");
  let live: LiveGame | undefined;
  if (liveEvent) {
    try {
      const summary = await getJson<{ header: { competitions: EspnEvent["competitions"] } }>(
        `${ESPN}/${path}/summary?event=${liveEvent.id}`
      );
      const s = split({ ...liveEvent, competitions: summary.header.competitions }, id);
      if (s) {
        live = {
          us: { abbr: abbrOf(s.us.team), score: scoreOf(s.us) },
          them: { abbr: abbrOf(s.them.team), score: scoreOf(s.them) },
          detail: s.comp.status.type.shortDetail,
        };
      }
    } catch {
      // fall through: show last/next instead
    }
  }

  // Next scheduled game.
  const upcoming = events
    .filter((e) => state(e) === "pre" && Date.parse(e.date) > Date.now() - 6 * 3600_000)
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date))[0];
  let next: UpcomingGame | undefined;
  const u = upcoming && split(upcoming, id);
  if (u) next = { opponent: nameOf(u.them.team), isHome: u.us.homeAway === "home", date: upcoming.date };

  return { live, last, next, record };
}

// ---------- Formula 1 ----------

export type F1Status = {
  lastRace?: { name: string; date: string; winner: string };
  nextRace?: { name: string; date: string };
  drivers: { code: string; position: number; points: number }[];
};

type ErgastRace = {
  raceName: string;
  date: string;
  time?: string;
  Results?: { Driver: { code: string } }[];
};

const TRACKED_DRIVERS = ["hamilton", "leclerc", "sainz", "albon"];

export async function fetchF1(): Promise<F1Status> {
  type RaceTable = { MRData: { RaceTable: { Races: ErgastRace[] } } };
  type Standings = {
    MRData: {
      StandingsTable: {
        StandingsLists: {
          DriverStandings: { position: string; points: string; Driver: { driverId: string; code: string } }[];
        }[];
      };
    };
  };

  const [last, next, standings] = await Promise.all([
    getJson<RaceTable>(`${F1}/last/results.json`).catch(() => null),
    getJson<RaceTable>(`${F1}/next.json`).catch(() => null),
    getJson<Standings>(`${F1}/driverStandings.json`).catch(() => null),
  ]);

  const lr = last?.MRData.RaceTable.Races[0];
  const nr = next?.MRData.RaceTable.Races[0];
  const list = standings?.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];

  return {
    lastRace: lr
      ? { name: lr.raceName, date: `${lr.date}T${lr.time ?? "12:00:00Z"}`, winner: lr.Results?.[0]?.Driver.code ?? "" }
      : undefined,
    nextRace: nr ? { name: nr.raceName, date: `${nr.date}T${nr.time ?? "12:00:00Z"}` } : undefined,
    drivers: list
      .filter((d) => TRACKED_DRIVERS.includes(d.Driver.driverId))
      .map((d) => ({ code: d.Driver.code, position: Number(d.position), points: Number(d.points) }))
      .sort((a, b) => a.position - b.position),
  };
}

// ---------- Tennis ----------

export type Tournament = { name: string; start: string; end?: string };

/** Headline tournament on an ESPN tennis tour ("atp" | "wta"). */
export async function fetchTournament(tour: "atp" | "wta"): Promise<Tournament | null> {
  const json = await getJson<{ events?: { name: string; date: string; endDate?: string }[] }>(
    `${ESPN}/tennis/${tour}/scoreboard`
  );
  const e = json.events?.[0];
  return e ? { name: e.name, start: e.date, end: e.endDate } : null;
}
