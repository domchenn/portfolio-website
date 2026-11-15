"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Entry } from "@/components/Entry";
import TeamsList from "@/components/TeamsList";

// `note` and `rating` (out of 10) are optional; leave them off to just list the course.
const courses: { name: string; code: string; note?: string; rating?: number }[] = [
  { name: "Machine Learning", code: "CSCI 3345" },
  { name: "Economics and Computation", code: "[course code]" },
  { name: "Probability Theory", code: "[course code] · now TA'ing it" },
  { name: "[Course]", code: "[course code]" },
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

function Courses() {
  return (
    <div className="flex flex-col border-t border-rule-soft">
      {courses.map((c, i) => (
        <div
          key={i}
          className="flex flex-wrap justify-between items-baseline gap-x-6 gap-y-1 py-3.5 border-b border-rule-soft"
        >
          <div className="flex-[1_1_360px] min-w-0">
            <span>{c.name}</span> <span className="text-label">{c.code}</span>
            {c.note && <p className="mt-0.5 mb-0 text-muted">{c.note}</p>}
          </div>
          {c.rating !== undefined && <span className="tabular-nums text-fg">{c.rating}/10</span>}
        </div>
      ))}
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
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
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
        onClick={() => setOpen((o) => !o)}
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
          <div className="flex flex-col gap-[1.7em] text-[19px] leading-[1.7]">
            <p className="m-0">
              I&apos;m a Computer Science student at Boston College with interests in technology,
              entrepreneurship, content creation, and building things that solve real problems.
            </p>
            <p className="m-0">
              I enjoy exploring new ideas, learning how things work, and finding creative ways to
              bring concepts to life. I&apos;m especially interested in the intersection of
              technology, business, and creativity, where I can combine technical thinking with
              storytelling and design.
            </p>
            <p className="m-0">
              Outside of academics, I&apos;m always looking for opportunities to learn, create, and
              connect with interesting people.
            </p>
          </div>

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
