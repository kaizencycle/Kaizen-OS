import Link from 'next/link';
import { JOURNEY_LOOP, PUBLIC_JOURNEY_URLS } from '@/lib/public-journey';

function PrimaryButton({
  href,
  children,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className =
    'inline-flex w-full items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/80 px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors hover:border-emerald-500/50 hover:bg-zinc-800 sm:w-auto';
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
    <article className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 backdrop-blur-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400/90">{label}</p>
      <h3 className="mt-3 text-xl font-semibold text-white">{headline}</h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{body}</p>
      {bullets && bullets.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-zinc-500">
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

export default function JourneyLandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            'radial-gradient(55% 45% at 50% 0%, rgba(16,185,129,.18), transparent 70%), radial-gradient(40% 35% at 80% 20%, rgba(99,102,241,.12), transparent 65%)',
        }}
      />

      <header className="relative border-b border-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <p className="text-sm font-semibold tracking-[0.35em] text-zinc-300">MOBIUS</p>
          <nav className="hidden gap-6 text-sm text-zinc-500 sm:flex" aria-label="Secondary">
            <a href="#journeys" className="hover:text-zinc-300">
              Journeys
            </a>
            <a href="#how-it-works" className="hover:text-zinc-300">
              How it works
            </a>
            <a href={PUBLIC_JOURNEY_URLS.handbook} className="hover:text-zinc-300" rel="noopener noreferrer">
              Handbook
            </a>
          </nav>
        </div>
      </header>

      <main className="relative">
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-16 text-center md:pt-24">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">Mobius</p>
          <h1 className="mt-6 space-y-2 text-4xl font-semibold leading-tight text-white md:text-5xl">
            <span className="block">See the world.</span>
            <span className="block">Understand the world.</span>
            <span className="block text-emerald-300/95">Help shape the world.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">
            A shared AI-native world where humans and machines learn, witness, simulate, and build
            together.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <PrimaryButton href={PUBLIC_JOURNEY_URLS.pulse} external>
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
              className="text-sm text-zinc-500 underline decoration-zinc-700 underline-offset-4 hover:text-zinc-300"
            >
              How Mobius Works →
            </a>
          </p>
        </section>

        {/* Three renderers */}
        <section id="journeys" className="border-t border-zinc-900/80 bg-black/20 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-zinc-500">
              Three ways in
            </h2>
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
                cta="Enter HIVE"
                href={PUBLIC_JOURNEY_URLS.hive}
              />
            </div>
            <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-zinc-600">
              Canon → Ledger → UI. Pulse, Chambers, and HIVE are renderers of witnessed memory — they
              do not independently define canonical truth.
            </p>
          </div>
        </section>

        {/* Core loop */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-lg font-semibold text-white">The Mobius loop</h2>
            <p className="mt-4 text-sm leading-relaxed text-zinc-400">
              Mobius turns human and AI activity into experiences that can be read, learned, played,
              and remembered.
            </p>
            <div
              className="mx-auto mt-8 max-w-xs font-mono text-sm leading-loose text-emerald-400/90"
              aria-label="Mobius journey loop"
            >
              {JOURNEY_LOOP.map((step, index) => (
                <div key={step}>
                  <span>{step}</span>
                  {index < JOURNEY_LOOP.length - 1 ? (
                    <div className="text-zinc-600">↓</div>
                  ) : (
                    <div className="text-zinc-600">↺</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Protocol introduction */}
        <section id="how-it-works" className="border-t border-zinc-900/80 bg-zinc-950/40 py-16">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-2xl font-semibold text-white">A world that remembers why.</h2>
            <p className="mt-6 text-sm leading-relaxed text-zinc-400">
              Most digital systems remember what happened. Mobius is designed to preserve what
              happened, why it happened, what was challenged, what evidence existed, and what changed
              afterward.
            </p>
            <p className="mt-4 text-xs text-zinc-600">
              Powered by EPICON, witnessed attestations, Canon, and the Civic Protocol Core.
            </p>
            <div className="mt-8">
              <PrimaryButton href={PUBLIC_JOURNEY_URLS.epicon} external>
                Explore the Protocol
              </PrimaryButton>
            </div>
          </div>
        </section>

        {/* MFS */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-center text-lg font-semibold text-white">
              Your progress is something you demonstrate.
            </h2>
            <p className="mt-4 text-center text-sm leading-relaxed text-zinc-400">
              As you learn, contribute, teach, reflect, and help, Mobius can recognize demonstrated
              capability through Mobius Fractal Shards — standing, reputation, lineage, and
              witnessed recognition.
            </p>
            <p className="mt-6 text-center text-sm font-medium text-zinc-300">
              A shard is a record that something meaningful was demonstrated and witnessed.
            </p>
            <ul className="mx-auto mt-6 max-w-md space-y-2 text-center text-xs text-zinc-600">
              <li>Not money · not transferable · not points for clicks</li>
              <li>Not a direct arithmetic conversion to MIC</li>
            </ul>
          </div>
        </section>

        {/* Architecture */}
        <section id="architecture" className="border-t border-zinc-900/80 py-16">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-center text-lg font-semibold text-white">
              One world. Multiple renderers. One chain of memory.
            </h2>
            <pre
              className="mt-8 overflow-x-auto rounded-xl border border-zinc-800 bg-black/40 p-4 text-center text-[11px] leading-relaxed text-zinc-500 sm:text-xs"
              aria-label="Mobius architecture diagram"
            >
{`                 EXPERIENCE
      PULSE      CHAMBERS      HIVE
        │            │           │
        └────────────┼───────────┘
                     │
                   CANON
                     │
             CIVIC PROTOCOL CORE
                     │
                  EPICON
                     │
              WITNESSED EVENTS
                     │
                HUMANS + AI`}
            </pre>
            <p className="mt-6 text-center text-xs text-zinc-600">
              No UI-derived truth. Canon → Ledger → UI.
            </p>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="border-t border-zinc-900/80 bg-black/30 py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-2xl font-semibold text-white">Where will you begin?</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <a
                href={PUBLIC_JOURNEY_URLS.pulse}
                className="rounded-xl border border-zinc-800 p-5 transition-colors hover:border-zinc-600"
                rel="noopener noreferrer"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Pulse</p>
                <p className="mt-2 text-sm text-zinc-400">Read the world</p>
              </a>
              <a
                href={PUBLIC_JOURNEY_URLS.chambers}
                className="rounded-xl border border-zinc-800 p-5 transition-colors hover:border-zinc-600"
                rel="noopener noreferrer"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Chambers</p>
                <p className="mt-2 text-sm text-zinc-400">Learn the world</p>
              </a>
              <a
                href={PUBLIC_JOURNEY_URLS.hive}
                className="rounded-xl border border-zinc-800 p-5 transition-colors hover:border-zinc-600"
                rel="noopener noreferrer"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">HIVE</p>
                <p className="mt-2 text-sm text-zinc-400">Play the world</p>
              </a>
            </div>
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-zinc-500"
              aria-label="Footer"
            >
              <a href={PUBLIC_JOURNEY_URLS.epicon} className="hover:text-zinc-300" rel="noopener noreferrer">
                EPICON
              </a>
              <a href={PUBLIC_JOURNEY_URLS.handbook} className="hover:text-zinc-300" rel="noopener noreferrer">
                Handbook
              </a>
              <a href={PUBLIC_JOURNEY_URLS.github} className="hover:text-zinc-300" rel="noopener noreferrer">
                GitHub
              </a>
              <a href={PUBLIC_JOURNEY_URLS.about} className="hover:text-zinc-300" rel="noopener noreferrer">
                About Mobius
              </a>
            </nav>
            <p className="mt-10 text-xs text-zinc-700">
              © {new Date().getFullYear()} Mobius Systems · Read the world. Learn the world. Play the
              world.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
