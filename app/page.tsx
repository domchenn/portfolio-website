import AboutPanel from "@/components/AboutPanel";
import Skyline from "@/components/Skyline";
import { Entry, ColumnHeading } from "@/components/Entry";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-[1] max-w-[760px] mx-auto px-7 pt-[120px] pb-[340px]">
        <main className="flex flex-col gap-[72px]">
          <header className="flex flex-col gap-7">
            <h1 className="m-0 text-[18px] font-medium tracking-[-0.01em]">Dominic Chen</h1>
            <p className="m-0 text-[19px] leading-[1.7]">
              <em className="italic">Building things people actually use.</em> CS + AI at{" "}
              <a href="https://www.bc.edu">Boston College</a> (&apos;28), from Western Mass. Right
              now: a finance app, a startup&apos;s backend, and a model that predicts Pokémon
              matches.
            </p>
          </header>

          <section
            aria-label="Work"
            className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-x-9 gap-y-10"
          >
            <div className="flex flex-col gap-7">
              <ColumnHeading>Building</ColumnHeading>
              <Entry title="Otto" href="#">
                A personal finance assistant for iOS. A dashboard, not a bank app.
              </Entry>
              <Entry title="Research">
                Starting spring 2027: counterbalancing sycophancy in AI agents.
              </Entry>
            </div>
            <div className="flex flex-col gap-7">
              <ColumnHeading>Projects</ColumnHeading>
              <Entry title="The Commons" href="#" external>
                Campus resource hub on AWS. 3rd place, Eagles Sustainability case comp.
              </Entry>
              <Entry
                title="Pokémon TCG Prediction"
                href="https://github.com/yd5256/ML-Project-Fall-2026"
                external
              >
                How early can you call the winner? 69% by turn 8.
              </Entry>
              <Entry title="PlaybackPilot" href="#" external>
                Chrome extension for controlling video playback.
              </Entry>
            </div>
            <div className="flex flex-col gap-7">
              <ColumnHeading>Experience</ColumnHeading>
              <Entry title="Student Weaver" href="https://studentweaver.com">
                Software Engineer. AI features for a student recruiting platform.
              </Entry>
              <Entry title="Boston College">Probability Theory TA.</Entry>
            </div>
          </section>

          <AboutPanel />

          <footer className="flex flex-wrap gap-x-7 gap-y-3 text-[16px]">
            <a href="https://github.com/chen-domi">GitHub</a>
            <a href="https://www.linkedin.com/in/chendomi">LinkedIn</a>
            <a href="mailto:gchendomi@gmail.com">Email</a>
            <a href="#">Résumé</a>
          </footer>
        </main>
      </div>
      <Skyline />
    </div>
  );
}
