import { useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router';
import gsap from 'gsap';

export interface TransitionRef {
  navigate: (path: string, color: string) => void;
}

const PageTransitionOverlay = forwardRef<TransitionRef>((_, ref) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isAnimating = useRef(false);

  useImperativeHandle(ref, () => ({
    navigate: (path: string, color: string) => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      const overlay = overlayRef.current;
      if (!overlay) {
        navigate(path);
        isAnimating.current = false;
        return;
      }

      overlay.style.backgroundColor = color;

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        },
      });

      tl.set(overlay, { clipPath: 'inset(0 50% 0 50%)', display: 'block' })
        .to(overlay, {
          clipPath: 'inset(0 0% 0 0%)',
          duration: 0.4,
          ease: 'power2.inOut',
          onComplete: () => navigate(path),
        })
        .to(overlay, {
          clipPath: 'inset(0 0 0 100%)',
          duration: 0.35,
          ease: 'power2.inOut',
        })
        .set(overlay, { display: 'none' });
    },
  }));

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[400] hidden"
      style={{ clipPath: 'inset(0 50% 0 50%)' }}
    />
  );
});

export default PageTransitionOverlay;
