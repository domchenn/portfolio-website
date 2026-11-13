"use client";

import { useState } from "react";
import { Entry } from "@/components/Entry";
import TeamsList from "@/components/TeamsList";

function SubHeading({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`m-0 text-[15px] font-normal text-label ${className}`}>{children}</h2>;
}

const courses = [
  { name: "Machine Learning", code: "CSCI 3345", note: "[One line: what made it good or bad]", rating: "[_]" },
  { name: "Economics and Computation", code: "[course code]", note: "[One line: what made it good or bad]", rating: "[_]" },
  { name: "Probability Theory", code: "[course code] · now TA'ing it", note: "[One line: what made it good or bad]", rating: "[_]" },
  { name: "[Course]", code: "[course code]", note: "[One line: what made it good or bad]", rating: "[_]" },
];

export default function AboutPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section aria-label="About" className="flex flex-col border-t border-rule">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="about-panel"
        className="box-border cursor-pointer flex items-center justify-between min-h-14 py-4 bg-transparent border-0 p-0 font-[inherit] text-[17px] text-fg text-left"
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
        <div id="about-panel" className="flex flex-col gap-14 pt-3 pb-2">
          <p className="m-0 text-[19px] leading-[1.7]">
            I love the moment something I built goes from an idea to a thing people actually use. I
            grew up in Western Mass helping run my family&apos;s restaurant, which is probably where
            the startup itch comes from. Until I start one, I&apos;m learning everything I can about
            building them.
          </p>

          <div className="flex flex-col gap-5">
            <SubHeading>Places I&apos;ve been</SubHeading>
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

          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-x-9 gap-y-10">
            <div className="flex flex-col gap-5">
              <SubHeading>Where I eat in Boston</SubHeading>
              {[0, 1, 2].map((i) => (
                <Entry key={i} title="[Restaurant]">
                  [Neighborhood · what to order]
                </Entry>
              ))}
            </div>
            <div className="flex flex-col gap-5">
              <SubHeading>Watching</SubHeading>
              <Entry title="[TV show]">[One line on why]</Entry>
              <Entry title="[TV show]">[One line on why]</Entry>
              <Entry title="[Movie]">[One line on why]</Entry>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <SubHeading className="mb-4">Courses, rated</SubHeading>
            <div className="flex flex-col border-t border-rule-soft">
              {courses.map((c, i) => (
                <div
                  key={i}
                  className="flex flex-wrap justify-between items-baseline gap-x-6 gap-y-1 py-3.5 border-b border-rule-soft"
                >
                  <div className="flex-[1_1_360px] min-w-0">
                    <span>{c.name}</span> <span className="text-label">{c.code}</span>
                    <p className="mt-0.5 mb-0 text-muted">{c.note}</p>
                  </div>
                  <span className="tabular-nums text-fg">{c.rating}/10</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <SubHeading className="mb-4">
              Teams I follow <span className="text-faint">· updates live</span>
            </SubHeading>
            <TeamsList />
          </div>
        </div>
      )}
    </section>
  );
}
