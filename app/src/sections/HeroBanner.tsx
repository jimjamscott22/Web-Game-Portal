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
    // fromTo, not from: these elements ship with `opacity-0` so nothing flashes
    // before GSAP runs, and `from` would read that 0 as the *end* value.
    const rise = { y: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' };
    const tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(eyebrowRef.current, { y: 40, opacity: 0 }, rise)
      .fromTo(line1Ref.current, { y: 40, opacity: 0 }, rise, '-=0.3')
      .fromTo(line2Ref.current, { y: 40, opacity: 0 }, rise, '-=0.35')
      .fromTo(subtitleRef.current, { y: 40, opacity: 0 }, rise, '-=0.3')
      .fromTo(ctaRef.current, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }, '-=0.2');
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--t-hero)' }}
    >
      {/* Drifting organic discs instead of the old pixel-shape wallpaper. */}
      <div className="pointer-events-none absolute -right-24 top-16 w-[420px] h-[420px] rounded-full bg-second-soft opacity-85" />
      <div className="pointer-events-none absolute right-24 top-32 w-[260px] h-[260px] rounded-full bg-accent-soft animate-float-drift" />
      <img
        src="/assets/cta-pixel-character.png"
        alt=""
        className="washed pointer-events-none absolute right-32 top-40 w-40 hidden lg:block"
      />

      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        <div
          ref={eyebrowRef}
          className="font-body text-xs font-semibold tracking-[0.2em] text-accent-deep uppercase mb-4 opacity-0"
        >
          Ten classic games
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-[68px] leading-[1.04] text-ink">
          <span ref={line1Ref} className="block opacity-0">
            Play classic
          </span>
          <span ref={line2Ref} className="block text-accent opacity-0">
            games online
          </span>
        </h1>

        <p
          ref={subtitleRef}
          className="font-body text-lg text-muted-foreground max-w-[520px] mx-auto mt-6 leading-relaxed opacity-0"
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
          <div className="relative w-0.5 h-[22px] bg-line overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-accent rounded-full animate-scroll-dot" />
          </div>
          <span className="font-body text-xs text-muted-foreground">Scroll to explore</span>
        </div>
      </div>
    </section>
  );
}
