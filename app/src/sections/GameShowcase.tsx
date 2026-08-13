import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import GameCard from '@/components/GameCard';
import { GAMES } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface GameShowcaseProps {
  onNavigate: (route: string, color: string) => void;
}

export default function GameShowcase({ onNavigate }: GameShowcaseProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
        },
      });

      gsap.from(subtextRef.current, {
        y: 30,
        opacity: 0,
        duration: 0.5,
        delay: 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
        },
      });

      const cards = gridRef.current?.children;
      if (cards) {
        gsap.from(cards, {
          y: 60,
          opacity: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 85%',
            once: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="games"
      ref={sectionRef}
      className="py-24 lg:py-32 px-6 lg:px-20 bg-[#F5F5F5]"
    >
      <div className="max-w-[1200px] mx-auto">
        <h2
          ref={headingRef}
          className="font-pixel text-4xl lg:text-5xl font-bold text-dark text-center opacity-0"
        >
          Choose Your <span className="text-accent">Game</span>
        </h2>

        <p
          ref={subtextRef}
          className="font-body text-base text-[#666666] text-center max-w-[480px] mx-auto mt-3 opacity-0"
        >
          Nine pixel-perfect games, each with its own challenge. Pick one and start playing instantly.
        </p>

        <div
          ref={gridRef}
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 mt-12 justify-items-center"
        >
          {GAMES.map((game) => (
            <GameCard key={game.id} gameId={game.id} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
    </section>
  );
}
