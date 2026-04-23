import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shuffle, ArrowUp } from 'lucide-react';
import PixelButton from '@/components/PixelButton';
import { GAMES } from '@/types';

gsap.registerPlugin(ScrollTrigger);

interface QuickPlayCTAProps {
  onNavigate: (route: string, color: string) => void;
  onScrollToGames: () => void;
}

export default function QuickPlayCTA({ onNavigate, onScrollToGames }: QuickPlayCTAProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(headingRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from(subtextRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        delay: 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
      gsap.from(buttonsRef.current, {
        y: 20,
        opacity: 0,
        duration: 0.5,
        delay: 0.2,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 85%', once: true },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleRandomGame = () => {
    const random = GAMES[Math.floor(Math.random() * GAMES.length)];
    onNavigate(random.route, random.color);
  };

  return (
    <section
      ref={sectionRef}
      className="py-20 lg:py-24 px-6 lg:px-20 bg-dark text-center"
    >
      <div className="max-w-[520px] mx-auto">
        <h2
          ref={headingRef}
          className="font-pixel text-4xl lg:text-[56px] font-bold text-white text-shadow-pixel-sm opacity-0"
        >
          Ready to <span className="text-accent">Play</span>?
        </h2>

        <p
          ref={subtextRef}
          className="font-body text-lg text-[#AAAAAA] mt-4 opacity-0"
        >
          Jump into any game right now. No downloads, no accounts, no waiting. Just pure arcade fun.
        </p>

        <div ref={buttonsRef} className="flex flex-wrap items-center justify-center gap-4 mt-8 opacity-0">
          <PixelButton variant="secondary" size="md" onClick={handleRandomGame}>
            <Shuffle className="w-5 h-5" />
            Random Game
          </PixelButton>
          <PixelButton
            variant="tertiary"
            size="md"
            onClick={onScrollToGames}
            className="!text-white !border-white hover:!bg-white/10"
          >
            <ArrowUp className="w-5 h-5" />
            View All Games
          </PixelButton>
        </div>

        <div className="mt-10 flex justify-center">
          <img
            src="/assets/cta-pixel-character.png"
            alt="Pixel character"
            className="w-24 h-24 object-contain"
          />
        </div>
      </div>
    </section>
  );
}
