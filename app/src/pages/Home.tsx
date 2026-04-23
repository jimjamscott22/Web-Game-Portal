import { useCallback, useRef } from 'react';
import HeroBanner from '@/sections/HeroBanner';
import GameShowcase from '@/sections/GameShowcase';
import QuickPlayCTA from '@/sections/QuickPlayCTA';
import Footer from '@/components/Footer';
import type { TransitionRef } from '@/components/PageTransitionOverlay';

interface HomeProps {
  transitionRef: React.RefObject<TransitionRef | null>;
}

export default function Home({ transitionRef }: HomeProps) {
  const gamesSectionRef = useRef<HTMLDivElement>(null);

  const handleNavigate = useCallback((route: string, color: string) => {
    transitionRef.current?.navigate(route, color);
  }, [transitionRef]);

  const handleStartPlaying = useCallback(() => {
    gamesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScrollToGames = useCallback(() => {
    gamesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen">
      <HeroBanner onStartPlaying={handleStartPlaying} />
      <div ref={gamesSectionRef}>
        <GameShowcase onNavigate={handleNavigate} />
      </div>
      <QuickPlayCTA onNavigate={handleNavigate} onScrollToGames={handleScrollToGames} />
      <Footer />
    </div>
  );
}
