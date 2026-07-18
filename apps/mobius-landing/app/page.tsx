import JourneyLandingPage from '@/components/journey/JourneyLandingPage';

/**
 * Public root for mobius-substrate.com — journey-first, SSR.
 * Builder.io visual pages remain available via app/[...page]/page.tsx.
 */
export default function Home() {
  return (
    <main>
      <JourneyLandingPage />
    </main>
  );
}
