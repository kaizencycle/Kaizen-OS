import Link from 'next/link';
import { JOURNEY_LOOP, PUBLIC_JOURNEY_URLS } from '@/lib/public-journey';

function PrimaryButton({
  href,
  children,
  external = false,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
  primary?: boolean;
}) {
  const className = `m-btn${primary ? ' m-btn-primary' : ''}`;
  if (external) {
    return (
      <a href={href} className={className} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function JourneyCard({
  label,
  headline,
  body,
  bullets,
  cta,
  href,
}: {
  label: string;
  headline: string;
  body: string;
  bullets?: string[];
  cta: string;
  href: string;
}) {
  return (
    <article className="m-card">
      <p className="m-card-label">{label}</p>
      <h3 className="m-display mt-3 text-xl">{headline}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed m-folio-muted">{body}</p>
      {bullets && bullets.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm m-folio-muted">
          {bullets.map((item) => (
            <li key={item}>· {item}</li>
          ))}
        </ul>
      )}
      <div className="mt-6">
        <PrimaryButton href={href} external>
          {cta}
        </PrimaryButton>
      </div>
    </article>
  );
}

function ChainOfMemoryFigure() {
  return (
    <figure className="m-figure" aria-labelledby="fig-chain-title">
      <figcaption id="fig-chain-title" className="m-figure-caption">
        FIG. 1 — THE CHAIN OF MEMORY
      </figcaption>
      <div className="m-figure-stack" role="img" aria-label="Mobius architecture: experience renderers flow to canon, civic protocol core, EPICON, witnessed events, and humans plus AI">
        <div className="m-figure-row">
          <span className="m-figure-node">Pulse</span>
          <span className="m-figure-node">Chambers</span>
          <span className="m-figure-node">HIVE</span>
        </div>
        <div className="m-figure-connector" aria-hidden="true" />
        <div className="m-figure-row">
          <span className="m-figure-node m-figure-node-accent">Canon</span>
        </div>
        <div className="m-figure-connector" aria-hidden="true" />
        <div className="m-figure-row">
          <span className="m-figure-node">Civic Protocol Core</span>
        </div>
        <div className="m-figure-connector" aria-hidden="true" />
        <div className="m-figure-row">
          <span className="m-figure-node m-figure-node-accent">EPICON</span>
        </div>
        <div className="m-figure-connector" aria-hidden="true" />
        <div className="m-figure-row">
          <span className="m-figure-node">Witnessed events</span>
        </div>
        <div className="m-figure-connector" aria-hidden="true" />
        <div className="m-figure-row">
          <span className="m-figure-node">Humans + AI</span>
        </div>
      </div>
      <p className="m-figure-subcaption">meaning flows up, truth flows down</p>
      <p className="m-figure-close">No UI-derived truth. Canon → Ledger → UI.</p>
    </figure>
  );
}

export default function JourneyLandingPage() {
  return (
    <div className="min-h-screen">
      <header className="m-vestibule border-b border-[var(--m-rule-dark)]">
        <div className="mx-auto flex max-w-[var(--m-max)] items-center justify-between px-6 py-5">
          <p className="m-eyebrow">Mobius</p>
          <nav className="hidden gap-6 text-sm sm:flex" aria-label="Secondary">
            <a href="#journeys" className="text-stone-400 hover:text-stone-200">
              Journeys
            </a>
            <a href="#how-it-works" className="text-stone-400 hover:text-stone-200">
              How it works
            </a>
            <a
              href={PUBLIC_JOURNEY_URLS.handbook}
              className="text-stone-400 hover:text-stone-200"
              rel="noopener noreferrer"
            >
              Handbook
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero — dark vestibule */}
        <section className="m-vestibule px-6 pb-16 pt-16 text-center md:pt-24">
          <div className="mx-auto max-w-[var(--m-narrow)]">
            <p className="m-eyebrow">Public front door</p>
            <h1 className="m-display mt-6 text-4xl md:text-5xl">
              <span className="block">See the world.</span>
              <span className="block">Understand the world.</span>
              <span className="block text-[#b8d4c0]">Help shape the world.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-stone-400 md:text-lg">
              A shared AI-native world where humans and machines learn, witness, simulate, and build
              together.
            </p>
            <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <PrimaryButton href={PUBLIC_JOURNEY_URLS.pulse} external primary>
                Read the Pulse
              </PrimaryButton>
              <PrimaryButton href={PUBLIC_JOURNEY_URLS.chambers} external>
                Enter the Chambers
              </PrimaryButton>
              <PrimaryButton href={PUBLIC_JOURNEY_URLS.hive} external>
                Explore HIVE
              </PrimaryButton>
            </div>
            <p className="mt-8">
              <a
                href="#how-it-works"
                className="text-sm text-stone-500 underline decoration-stone-700 underline-offset-4 hover:text-stone-300"
              >
                How Mobius Works →
              </a>
            </p>
          </div>
        </section>

        <hr className="m-rule" />

        {/* Three renderers — lit folio */}
        <section id="journeys" className="m-folio px-6 py-16">
          <div className="mx-auto max-w-[var(--m-max)]">
            <h2 className="m-eyebrow text-center">Three ways in</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <JourneyCard
                label="Read — Pulse"
                headline="Understand what is happening."
                body="Pulse renders integrity signals, witnessed events, uncertainty, challenges, disputes, and system health into information anyone can read."
                bullets={[
                  'What happened?',
                  'What evidence exists?',
                  'What is disputed?',
                  'What remains uncertain?',
                ]}
                cta="Explore Pulse"
                href={PUBLIC_JOURNEY_URLS.pulse}
              />
              <JourneyCard
                label="Learn — Chambers"
                headline="Learn the way you learn."
                body="The School of Chambers is an AI-native learning environment — conversation, stories, visual explanations, experimentation, reflection, and simulation."
                bullets={['No two minds have to take the same hallway.']}
                cta="Enter the Hallway"
                href={PUBLIC_JOURNEY_URLS.chambers}
              />
              <JourneyCard
                label="Play — HIVE"
                headline="Explore what could happen next."
                body="HIVE is the playable renderer of Mobius — a sandboxed simulation environment, not an authority layer. Test ideas inside a world and see what changes."
                bullets={[
                  'Learn something in a Chamber.',
                  'Test it inside a world.',
                  'See what changes.',
                ]}
                cta="Read how HIVE works"
                href={PUBLIC_JOURNEY_URLS.hive}
              />
            </div>
            <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed m-folio-muted">
              Canon → Ledger → UI. Pulse, Chambers, and HIVE are renderers of witnessed memory — they
              do not independently define canonical truth.
            </p>
          </div>
        </section>

        <hr className="m-rule" />

        {/* Core loop */}
        <section className="m-folio px-6 py-16">
          <div className="mx-auto max-w-[var(--m-narrow)] text-center">
            <h2 className="m-display text-lg">The Mobius loop</h2>
            <p className="mt-4 text-sm leading-relaxed m-folio-muted">
              Mobius turns human and AI activity into experiences that can be read, learned, played,
              and remembered.
            </p>
            <div className="mt-8" aria-label="Mobius journey loop">
              <div className="m-loop-strip">
                {JOURNEY_LOOP.map((step, index) => (
                  <span key={step} className="contents">
                    <span className="m-loop-step">{step}</span>
                    {index < JOURNEY_LOOP.length - 1 ? (
                      <span className="m-loop-arrow" aria-hidden="true">
                        →
                      </span>
                    ) : (
                      <span className="m-loop-arrow m-loop-return" aria-hidden="true">
                        ↺
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <hr className="m-rule" />

        {/* Protocol introduction */}
        <section id="how-it-works" className="m-folio px-6 py-16">
          <div className="mx-auto max-w-[var(--m-narrow)] text-center">
            <h2 className="m-display text-2xl">A world that remembers why.</h2>
            <p className="mt-6 text-sm leading-relaxed m-folio-muted">
              Most digital systems remember what happened. Mobius is designed to preserve what
              happened, why it happened, what was challenged, what evidence existed, and what changed
              afterward.
            </p>
            <p className="mt-4 text-xs m-folio-muted">
              Powered by EPICON, witnessed attestations, Canon, and the Civic Protocol Core.
            </p>
            <div className="mt-8">
              <PrimaryButton href={PUBLIC_JOURNEY_URLS.epicon} external>
                Explore the Protocol
              </PrimaryButton>
            </div>
          </div>
        </section>

        <hr className="m-rule" />

        {/* MFS — quietest register */}
        <section className="m-folio px-6 py-16">
          <div className="mx-auto max-w-[var(--m-narrow)]">
            <h2 className="m-display text-center text-lg">
              Your progress is something you demonstrate.
            </h2>
            <p className="mt-4 text-center text-sm leading-relaxed m-folio-muted">
              As you learn, contribute, teach, reflect, and help, Mobius can recognize demonstrated
              capability through Mobius Fractal Shards — standing, reputation, lineage, and
              witnessed recognition.
            </p>
            <p className="mt-6 text-center text-sm font-medium">
              A shard is a record that something meaningful was demonstrated and witnessed.
            </p>
            <ul className="mx-auto mt-6 max-w-md space-y-2 text-center m-mfs-quiet">
              <li>Not money · not transferable · not points for clicks</li>
              <li>Not a direct arithmetic conversion to MIC</li>
            </ul>
          </div>
        </section>

        <hr className="m-rule" />

        {/* Architecture — signature element */}
        <section id="architecture" className="m-folio px-6 py-16">
          <div className="mx-auto max-w-[var(--m-narrow)]">
            <h2 className="m-display text-center text-lg">
              One world. Multiple renderers. One chain of memory.
            </h2>
            <ChainOfMemoryFigure />
          </div>
        </section>

        <hr className="m-rule" />

        {/* Footer CTA */}
        <section className="m-folio px-6 py-16">
          <div className="mx-auto max-w-[var(--m-max)] text-center">
            <h2 className="m-display text-2xl">Where will you begin?</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <a
                href={PUBLIC_JOURNEY_URLS.pulse}
                className="m-journey-tile"
                rel="noopener noreferrer"
              >
                <p className="m-card-label">Pulse</p>
                <p className="mt-2 text-sm m-folio-muted">Read the world</p>
              </a>
              <a
                href={PUBLIC_JOURNEY_URLS.chambers}
                className="m-journey-tile"
                rel="noopener noreferrer"
              >
                <p className="m-card-label">Chambers</p>
                <p className="mt-2 text-sm m-folio-muted">Learn the world</p>
              </a>
              <a
                href={PUBLIC_JOURNEY_URLS.hive}
                className="m-journey-tile"
                rel="noopener noreferrer"
              >
                <p className="m-card-label">HIVE</p>
                <p className="mt-2 text-sm m-folio-muted">Read how HIVE works</p>
              </a>
            </div>
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
              aria-label="Footer"
            >
              <a href={PUBLIC_JOURNEY_URLS.epicon} className="m-footer-link" rel="noopener noreferrer">
                EPICON
              </a>
              <a href={PUBLIC_JOURNEY_URLS.handbook} className="m-footer-link" rel="noopener noreferrer">
                Handbook
              </a>
              <a href={PUBLIC_JOURNEY_URLS.github} className="m-footer-link" rel="noopener noreferrer">
                GitHub
              </a>
              <a href={PUBLIC_JOURNEY_URLS.about} className="m-footer-link" rel="noopener noreferrer">
                About Mobius
              </a>
            </nav>
            <p className="mt-10 text-xs m-folio-muted">
              © {new Date().getFullYear()} Mobius Systems · Read the world. Learn the world. Play the
              world.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
