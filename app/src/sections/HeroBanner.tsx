import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import PixelButton from '@/components/PixelButton';

interface HeroBannerProps {
  onStartPlaying: () => void;
}

export default function HeroBanner({ onStartPlaying }: HeroBannerProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.3 });
    tl.from(eyebrowRef.current, { y: 40, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' })
      .from(line1Ref.current, { y: 40, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3')
      .from(line2Ref.current, { y: 40, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.35')
      .from(subtitleRef.current, { y: 40, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3')
      .from(ctaRef.current, { scale: 0.8, opacity: 0, duration: 0.4, ease: 'back.out(1.7)' }, '-=0.2');
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #C8E6E1 0%, #F5F5F5 50%, #FEF1CD 100%)' }}
    >
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: 'url(/assets/hero-bg-shapes.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <div
          ref={eyebrowRef}
          className="font-body text-sm font-medium tracking-[0.2em] text-primary uppercase mb-4 opacity-0"
        >
          5 CLASSIC GAMES
        </div>

        <h1 className="font-pixel text-5xl sm:text-6xl lg:text-[72px] font-bold leading-tight">
          <span ref={line1Ref} className="block text-dark text-shadow-pixel opacity-0">
            Play Classic
          </span>
          <span ref={line2Ref} className="block text-accent text-shadow-pixel opacity-0">
            Games Online
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="font-body text-lg text-[#555555] max-w-[560px] mx-auto mt-6 leading-relaxed opacity-0"
        >
          Challenge yourself with 2048, Minesweeper, Snake, Tetris, and Sudoku. All free, all fun, right in your browser.
        </p>

        <div ref={ctaRef} className="mt-8 opacity-0">
          <PixelButton
            variant="primary"
            size="lg"
            onClick={onStartPlaying}
            className="animate-pulse-glow"
          >
            Start Playing
          </PixelButton>
        </div>

        <div className="mt-16 flex flex-col items-center gap-2">
          <div className="relative w-0.5 h-6 bg-dark/30 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-dark rounded-full animate-scroll-dot" />
          </div>
          <span className="font-body text-xs text-[#888888]">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
}
