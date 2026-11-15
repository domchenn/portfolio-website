"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { Entry } from "@/components/Entry";
import TeamsList from "@/components/TeamsList";
import { usePersistentState } from "@/lib/usePersistentState";

// Courses by term (no grades). `note` and `rating` (out of 10) are optional per course.
type Course = { name: string; code: string; note?: string; rating?: number };

type TermStatus = "next" | "now" | "past";
const courseTerms: { term: string; status: TermStatus; courses: Course[] }[] = [
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
  {
    term: "Fall 2026",
    status: "now",
    courses: [
      { name: "Machine Learning", code: "CSCI 3345" },
      { name: "Economics and Computation", code: "CSCI 3369" },
      { name: "Computer Systems", code: "CSCI 2271" },
      { name: "Differential Equations", code: "MATH 4410" },
    ],
  },
  {
    term: "Earlier",
    status: "past",
    courses: [
      { name: "Randomness and Computation", code: "CSCI 2244", note: "Now TA'ing it" },
      { name: "Logic and Computation", code: "CSCI 2243" },
      { name: "Data, Ethics and Society", code: "CSCI 2268" },
      { name: "Computer Organization and Lab", code: "CSCI 2272" },
      { name: "Computer Science II", code: "CSCI 1102" },
      { name: "Computer Science I", code: "CSCI 1101" },
      { name: "Linear Algebra", code: "MATH 2210" },
      { name: "Multivariable Calculus", code: "MATH 2202" },
      { name: "Calculus II", code: "MATH 1103" },
      { name: "Principles of Economics", code: "ECON 1101" },
    ],
  },
];

function Places() {
  return (
    <div className="flex flex-col gap-5">
      <div
        role="img"
        aria-label="Map placeholder for travel pins"
        className="h-[280px] border border-dashed border-dash rounded-md flex items-center justify-center text-label text-[15px]"
      >
        [Map with a pin per destination]
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n}>[Destination {n}]</span>
        ))}
      </div>
    </div>
  );
}

function Food() {
  return (
    <div className="flex flex-col gap-5">
      {[0, 1, 2].map((i) => (
        <Entry key={i} title="[Restaurant]">
          [Neighborhood · what to order]
        </Entry>
      ))}
    </div>
  );
}

function Watching() {
  return (
    <div className="flex flex-col gap-5">
      <Entry title="[TV show]">[One line on why]</Entry>
      <Entry title="[TV show]">[One line on why]</Entry>
      <Entry title="[Movie]">[One line on why]</Entry>
    </div>
  );
}

const dotStyles: Record<TermStatus, string> = {
  now: "bg-fg border-fg",
  next: "bg-bg border-fg",
  past: "bg-bg border-label",
};

/** Vertical timeline: one dot per term (newest first), courses inline as compact text. */
function CoursesTimeline() {
  return (
    <ol className="m-0 p-0 list-none flex flex-col">
      {courseTerms.map(({ term, status, courses }, i) => {
        const isLast = i === courseTerms.length - 1;
        return (
          <li key={term} className="relative pl-7 pb-8 last:pb-0">
            {/* rail */}
            {!isLast && (
              <span aria-hidden="true" className="absolute left-[5px] top-3 bottom-0 w-px bg-rule" />
            )}
            {/* dot */}
            <span
              aria-hidden="true"
              className={`absolute left-0 top-[7px] w-[11px] h-[11px] rounded-full border ${dotStyles[status]}`}
            />
            <h3 className="m-0 text-[15px] font-normal">
              <span className={status === "past" ? "text-label" : "text-fg"}>{term}</span>
              {status !== "past" && <span className="text-label"> · {status}</span>}
            </h3>
            <p className="mt-1.5 mb-0 text-muted leading-[1.7]">
              {courses.map((c, j) => (
                <span key={c.code}>
                  <span title={c.code} className="whitespace-nowrap">
                    {c.name}
                    {c.note && <span className="text-label"> ({c.note})</span>}
                    {c.rating !== undefined && <span className="text-label"> {c.rating}/10</span>}
                  </span>
                  {j < courses.length - 1 && <span className="text-label" aria-hidden="true"> · </span>}
                </span>
              ))}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

const SUBJECTS: Record<string, string> = { CSCI: "Computer Science", MATH: "Math", ECON: "Economics" };

/** Courses grouped by subject (from the course code prefix), current/next ones tagged. */
function CoursesBySubject() {
  const groups = new Map<string, (Course & { status: TermStatus })[]>();
  for (const { status, courses } of courseTerms) {
    for (const c of courses) {
      const subject = SUBJECTS[c.code.split(" ")[0]] ?? "Other";
      if (!groups.has(subject)) groups.set(subject, []);
      groups.get(subject)!.push({ ...c, status });
    }
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-x-9 gap-y-8">
      {[...groups].map(([subject, courses]) => (
        <div key={subject} className="flex flex-col gap-2">
          <h3 className="m-0 text-[15px] font-normal text-label">{subject}</h3>
          <ul className="m-0 p-0 list-none flex flex-col border-t border-rule-soft">
            {courses.map((c) => (
              <li
                key={c.code}
                title={c.code}
                className="flex justify-between items-baseline gap-4 py-2 border-b border-rule-soft"
              >
                <span className="min-w-0">
                  {c.name}
                  {c.note && <span className="text-label"> ({c.note})</span>}
                </span>
                {c.status !== "past" && (
                  <span className={`shrink-0 text-[15px] ${c.status === "now" ? "text-fg" : "text-label"}`}>
                    {c.status}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

const COURSE_VIEWS = [
  { id: "term", label: "By term" },
  { id: "subject", label: "By subject" },
] as const;

function Courses() {
  const [view, setView] = usePersistentState("courses:view", "term");
  return (
    <div className="flex flex-col gap-6">
      <div role="group" aria-label="Course layout" className="flex gap-4 text-[15px]">
        {COURSE_VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={view === v.id}
            onClick={() => setView(v.id)}
            className={`cursor-pointer bg-transparent border-0 p-0 font-[inherit] transition-colors ${
              view === v.id ? "text-fg" : "text-label hover:text-fg"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
      {view === "subject" ? <CoursesBySubject /> : <CoursesTimeline />}
    </div>
  );
}

// Set `hidden: true` to take a tab off the page without deleting its content.
const allTabs: { id: string; label: string; content: ReactNode; hidden?: boolean }[] = [
  { id: "places", label: "Places I've been", content: <Places />, hidden: true },
  { id: "food", label: "Where I eat", content: <Food />, hidden: true },
  { id: "watching", label: "Watching", content: <Watching />, hidden: true },
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
  { id: "courses", label: "Courses I've taken", content: <Courses /> },
];

const tabs = allTabs.filter((t) => !t.hidden);

export default function AboutPanel() {
  // Remembered across refreshes so the panel doesn't snap shut on reload.
  const [openPref, setOpenPref] = usePersistentState("about:open", "0");
  const [tabPref, setTabPref] = usePersistentState("about:tab", tabs[0].id);
  const open = openPref === "1";
  const active = Math.max(0, tabs.findIndex((t) => t.id === tabPref));
  const setActive = (i: number) => setTabPref(tabs[i].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

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
              role="tablist"
              aria-label="More about me"
              onKeyDown={onTabKey}
              className="flex flex-wrap gap-x-6 gap-y-2 border-b border-rule-soft"
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
                    className={`-mb-px cursor-pointer bg-transparent border-0 border-b px-0 pb-2.5 pt-1 font-[inherit] text-[15px] transition-colors ${selected ? "text-fg border-fg" : "text-label border-transparent hover:text-fg"
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
                {t.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
