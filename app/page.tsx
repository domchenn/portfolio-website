import AboutPanel from "@/components/AboutPanel";
import { Entry, ColumnHeading } from "@/components/Entry";

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <div className="relative z-[1] max-w-[760px] mx-auto px-7 pt-[120px] pb-16">
        <main className="flex flex-col gap-[72px]">
          <header className="flex flex-col gap-7">
            <h1 className="m-0 text-[18px] font-medium tracking-[-0.01em]">Dominic Chen</h1>
            <p className="m-0 text-[19px] leading-[1.7]">
              <em className="italic"></em> CS + AI + Math at{" "}
              <a href="https://www.bc.edu">Boston College </a>  (&apos;28)
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
            </div>
            <div className="flex flex-col gap-7">
              <ColumnHeading>Projects</ColumnHeading>
              <Entry title="The Commons" href="#" external>
                Campus resource hub for student organizations at Boston College. 3rd place, Eagles Sustainability case comp.
              </Entry>
              <Entry
                title="Pokémon TCG Prediction"
                href="https://github.com/yd5256/ML-Project-Fall-2026"
                external
              >
                Predicting how early in a match you can confidently predict winner of a TCG match.
              </Entry>
              <Entry title="PlaybackPilot" href="#" external>
                Chrome extension for controlling video playback for various sites.
              </Entry>
            </div>
            <div className="flex flex-col gap-7">
              <ColumnHeading>Experience</ColumnHeading>
              <Entry title="Weaver" href="https://studentweaver.com">
                Software Engineer. AI features for a student recruiting platform.
              </Entry>
              <Entry title="Boston College">
                Research Assistant. counterbalancing sycophancy in AI agents.
              </Entry>
              <Entry title="Boston College">Probability Theory TA.</Entry>
              <Entry title="AWS">Campus Ambassador.</Entry>
              <Entry title="Boston College">Library IT Assistant.</Entry>
            </div>
          </section>

          <AboutPanel />

          <footer className="flex flex-wrap gap-x-7 gap-y-3 text-[16px]">
            <a href="https://github.com/domchenn">GitHub</a>
            <a href="https://www.linkedin.com/in/chendomi">LinkedIn</a>
            <a href="mailto:gchendomi@gmail.com">Email</a>
            <a href="#">Résumé</a>
          </footer>
        </main>
      </div>
    </div>
  );
}
