"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Entry } from "@/components/Entry";
import TeamsList from "@/components/TeamsList";
import { usePersistentState } from "@/lib/usePersistentState";

// CS + Math courses by semester, listed oldest first (shown newest first). No grades.
// `note` and `rating` (out of 10) are optional per course.
type Course = { name: string; code: string; note?: string; rating?: number };
type TermStatus = "past" | "now" | "next";

const courseTerms: { term: string; year?: string; status: TermStatus; courses: Course[] }[] = [
  {
    term: "Fall 2024",
    year: "Freshman",
    status: "past",
    courses: [
      { name: "Computer Science I", code: "CSCI 1101" },
      { name: "Calculus II", code: "MATH 1103" },
    ],
  },
  {
    term: "Spring 2025",
    status: "past",
    courses: [
      { name: "Computer Science II", code: "CSCI 1102" },
      { name: "Logic and Computation", code: "CSCI 2243" },
      { name: "Computer Organization and Lab", code: "CSCI 2272" },
    ],
  },
  {
    term: "Fall 2025",
    year: "Sophomore",
    status: "past",
    courses: [{ name: "Linear Algebra", code: "MATH 2210" }],
  },
  {
    term: "Spring 2026",
    status: "past",
    courses: [
      { name: "Randomness and Computation", code: "CSCI 2244" },
      { name: "Data, Ethics and Society", code: "CSCI 2268" },
      { name: "Multivariable Calculus", code: "MATH 2202" },
    ],
  },
  {
    term: "Fall 2026",
    year: "Junior",
    status: "now",
    courses: [
      { name: "Machine Learning", code: "CSCI 3345" },
      { name: "Economics and Computation", code: "CSCI 3369" },
      { name: "Computer Systems", code: "CSCI 2271" },
      { name: "Differential Equations", code: "MATH 4410" },
    ],
  },
  {
    term: "Spring 2027",
    status: "next",
    courses: [
      { name: "Algorithms", code: "CSCI 3383" },
      { name: "Applied AI Systems", code: "CSCI 3400" },
      { name: "AI and Ethics", code: "CSCI 3334" },
      { name: "Introduction to Abstract Mathematics", code: "MATH 2216" },
      { name: "Probability", code: "MATH 4426" },
    ],
  },
];

const interests: { title: string; note: string }[] = [
  { title: "Travel", note: "Points and miles: using credit card rewards to get further for less." },
  { title: "Medicine and health", note: "How medicine works, and where technology can help." },
  { title: "Finance", note: "Personal finance and markets. Part of why I'm building Otto." },
];

function Interests() {
  return (
    <div className="flex flex-col gap-5">
      {interests.map((i) => (
        <Entry key={i.title} title={i.title}>
          {i.note}
        </Entry>
      ))}
    </div>
  );
}

// Top restaurants by city, in order. Add a city to get a new sub-tab; `note` is optional (e.g. what to order).
type Restaurant = { name: string; note?: string };

const eats: { city: string; places: Restaurant[] }[] = [
  {
    city: "Boston",
    places: [
      { name: "Yume Ga Arukara" },
      { name: "Rochambeau" },
      { name: "Avra" },
      { name: "Bar Vlaha" },
      { name: "Mountain House" },
    ],
  },
];

function Food() {
  const [cityPref, setCity] = usePersistentState("eats:city", eats[0].city);
  const current = eats.find((e) => e.city === cityPref) ?? eats[0];
  return (
    <div className="flex flex-col gap-5">
      <div role="group" aria-label="City" className="flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
        {eats.map(({ city }) => (
          <button
            key={city}
            type="button"
            aria-pressed={city === current.city}
            onClick={() => setCity(city)}
            className={`cursor-pointer bg-transparent border-0 p-0 font-[inherit] transition-colors ${
              city === current.city ? "text-fg" : "text-label hover:text-fg"
            }`}
          >
            {city}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="m-0 text-[15px] font-normal text-label">
          Top restaurants I&apos;ve eaten at in {current.city}
        </h3>
        <ol className="m-0 p-0 list-none flex flex-col border-t border-rule-soft">
          {current.places.map((r, i) => (
            <li key={r.name} className="flex gap-4 items-baseline py-2.5 border-b border-rule-soft">
              <span className="w-4 shrink-0 text-[15px] text-label tabular-nums">{i + 1}</span>
              <span className="min-w-0">
                {r.name}
                {r.note && <span className="block text-[15px] text-muted">{r.note}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// Top 5s, in order. Add `note` to a title for a one-line take.
type Title = { name: string; year: string; note?: string };

const topLists: { heading: string; items: Title[] }[] = [
  {
    heading: "Shows",
    items: [
      { name: "The Big Bang Theory", year: "2007–2019" },
      { name: "Suits", year: "2011–2019" },
      { name: "Grey's Anatomy", year: "2005–" },
      { name: "Breaking Bad", year: "2008–2013" },
      { name: "Ted Lasso", year: "2020–" },
    ],
  },
  {
    heading: "Movies",
    items: [
      { name: "The Social Network", year: "2010" },
      { name: "Parasite", year: "2019" },
      { name: "Ratatouille", year: "2007" },
      { name: "Spirited Away", year: "2001" },
      { name: "Inglourious Basterds", year: "2009" },
    ],
  },
];

function Watching() {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-9 gap-y-8">
      {topLists.map(({ heading, items }) => (
        <div key={heading} className="flex flex-col gap-2">
          <h3 className="m-0 text-[15px] font-normal text-label">{heading}</h3>
          <ol className="m-0 p-0 list-none flex flex-col border-t border-rule-soft">
            {items.map((t, i) => (
              <li key={t.name} className="flex gap-4 items-baseline py-2.5 border-b border-rule-soft">
                <span className="w-4 shrink-0 text-[15px] text-label tabular-nums">{i + 1}</span>
                <span className="min-w-0">
                  {t.name} <span className="text-[15px] text-label tabular-nums">{t.year}</span>
                  {t.note && <span className="block text-muted">{t.note}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

const dotStyles: Record<TermStatus, string> = {
  past: "bg-bg border-label",
  now: "bg-fg border-fg",
  next: "bg-bg border-fg border-dashed",
};

/** Vertical timeline, newest at the top: next semester, now, then back to freshman year. */
function Courses() {
  const terms = [...courseTerms].reverse();
  return (
    <ol className="m-0 p-0 list-none flex flex-col">
      {terms.map(({ term, year, status, courses }, i) => {
        const isLast = i === terms.length - 1;
        return (
          <li key={term} className="relative pl-7 pb-7 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute left-[5px] top-3 bottom-0 w-px ${
                  status === "next" ? "border-l border-dashed border-rule" : "bg-rule"
                }`}
              />
            )}
            <span
              aria-hidden="true"
              className={`absolute left-0 top-[7px] w-[11px] h-[11px] rounded-full border ${dotStyles[status]}`}
            />
            <h3 className="m-0 text-[15px] font-normal">
              <span className={status === "past" ? "text-label" : "text-fg"}>{term}</span>
              {year && <span className="text-label"> · {year}</span>}
              {status !== "past" && <span className="text-label"> · {status}</span>}
            </h3>
            <p className="mt-1 mb-0 text-muted leading-[1.7]">
              {courses.map((c, j) => (
                <span key={c.code}>
                  <span title={c.code} className="whitespace-nowrap">
                    {c.name}
                    {c.note && <span className="text-label"> ({c.note})</span>}
                    {c.rating !== undefined && <span className="text-label"> {c.rating}/10</span>}
                  </span>
                  {j < courses.length - 1 && (
                    <span className="text-label" aria-hidden="true">
                      {" · "}
                    </span>
                  )}
                </span>
              ))}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

// Set `hidden: true` to take a tab off the page without deleting its content.
const allTabs: { id: string; label: string; content: ReactNode; hidden?: boolean }[] = [
  {
    id: "teams",
    label: "Sports teams I follow",
    content: (
      <div className="flex flex-col gap-3">
        <span className="text-[15px] text-faint">Updates live</span>
        <TeamsList />
      </div>
    ),
  },
  // Filled in from the server (see `places` prop) so the map ships as static SVG.
  { id: "places", label: "Places I've been", content: null },
  { id: "watching", label: "Top shows & movies", content: <Watching /> },
  { id: "food", label: "Top restaurants", content: <Food /> },
  { id: "courses", label: "Courses I've taken", content: <Courses /> },
  { id: "interests", label: "Interests", content: <Interests />, hidden: true },
];

const tabs = allTabs.filter((t) => !t.hidden);

export default function AboutPanel({ places }: { places?: ReactNode }) {
  // Remembered across refreshes so the panel doesn't snap shut on reload.
  const [openPref, setOpenPref] = usePersistentState("about:open", "0");
  const [tabPref, setTabPref] = usePersistentState("about:tab", tabs[0].id);
  const open = openPref === "1";
  const active = Math.max(0, tabs.findIndex((t) => t.id === tabPref));
  const setActive = (i: number) => setTabPref(tabs[i].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [fade, setFade] = useState({ left: false, right: false });

  // Tab row scrolls sideways: track whether there's more to either side (drives the edge fades).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () =>
      setFade({ left: el.scrollLeft > 1, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1 });
    const ro = new ResizeObserver(update); // also fires once on observe
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [open]);

  // Keep the selected tab in view (horizontal only, so the page never jumps vertically).
  useEffect(() => {
    const scroller = scrollerRef.current;
    const tab = tabRefs.current[active];
    if (!scroller || !tab) return;
    const pad = 32;
    const left = tab.offsetLeft - scroller.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left < scroller.scrollLeft + pad) scroller.scrollTo({ left: Math.max(0, left - pad), behavior: "smooth" });
    else if (right > scroller.scrollLeft + scroller.clientWidth - pad)
      scroller.scrollTo({ left: right - scroller.clientWidth + pad, behavior: "smooth" });
  }, [active, open]);

  const mask =
    fade.left || fade.right
      ? `linear-gradient(to right, ${fade.left ? "transparent 0, #000 40px" : "#000 0"}, ${
          fade.right ? "#000 calc(100% - 40px), transparent 100%" : "#000 100%"
        })`
      : undefined;

  function onTabKey(e: KeyboardEvent) {
    const last = tabs.length - 1;
    const next =
      e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
        : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
          : e.key === "Home" ? 0
            : e.key === "End" ? last
              : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section aria-label="About" className="flex flex-col border-t border-rule">
      <button
        type="button"
        onClick={() => setOpenPref(open ? "0" : "1")}
        aria-expanded={open}
        aria-controls="about-panel"
        className="box-border cursor-pointer flex items-center justify-between min-h-14 py-4 bg-transparent border-0 font-[inherit] text-[17px] text-fg text-left"
      >
        <span>More about me</span>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="#A3A3A3"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-200 ease-in-out"
          style={{ transform: `rotate(${open ? 180 : 0}deg)` }}
        >
          <path d="M4 6 L8 10 L12 6" />
        </svg>
      </button>

      {open && (
        <div id="about-panel" className="flex flex-col gap-10 pt-3 pb-2">
          <div className="flex flex-col gap-6">
            <div
              ref={scrollerRef}
              role="tablist"
              aria-label="More about me"
              onKeyDown={onTabKey}
              style={{ maskImage: mask, WebkitMaskImage: mask }}
              className="flex gap-6 overflow-x-auto overscroll-x-contain snap-x [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shadow-[inset_0_-1px_0_var(--rule-soft)]"
            >
              {tabs.map((t, i) => {
                const selected = i === active;
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`tab-${t.id}`}
                    aria-selected={selected}
                    aria-controls={`panel-${t.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(i)}
                    className={`shrink-0 snap-start whitespace-nowrap cursor-pointer bg-transparent border-0 border-b px-0 pb-2.5 pt-1 font-[inherit] text-[15px] transition-colors ${selected ? "text-fg border-fg" : "text-label border-transparent hover:text-fg"
                      }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* All panels stay mounted (just hidden) so live team data loads in the background. */}
            {tabs.map((t, i) => (
              <div
                key={t.id}
                role="tabpanel"
                id={`panel-${t.id}`}
                aria-labelledby={`tab-${t.id}`}
                hidden={i !== active}
              >
                {t.id === "places" ? places : t.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
