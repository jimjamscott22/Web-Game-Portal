import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { NAV_GAMES } from '@/types';
import SkinPicker from './SkinPicker';

export default function NavigationBar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 h-[76px] bg-surface border-b border-line z-[100] transition-shadow duration-300 ${
          scrolled ? 'shadow-soft' : ''
        }`}
      >
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between gap-6 px-6 lg:px-10">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <span className="w-[30px] h-[30px] rounded-full bg-accent flex items-center justify-center font-pixel text-[15px] text-accent-foreground">
              P
            </span>
            <span className="font-display text-[22px] text-ink tracking-[-0.01em]">Pixelplay</span>
          </Link>

          <div className="hidden xl:flex items-center gap-5">
            {NAV_GAMES.map((game) => (
              <Link
                key={game.id}
                to={game.route}
                className="font-body text-sm font-medium text-muted-foreground hover:text-accent transition-colors duration-200"
              >
                {game.title}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <SkinPicker />
            <Link
              to={isHome ? '/2048' : location.pathname}
              className="hidden md:inline-flex btn btn-primary text-[15px] px-[22px] py-[11px]"
            >
              Play now
            </Link>

            <button
              className="xl:hidden flex flex-col gap-1.5 p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <span className={`w-5 h-0.5 bg-ink transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[8px]' : ''}`} />
              <span className={`w-5 h-0.5 bg-ink transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`w-5 h-0.5 bg-ink transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 bg-ground z-[150] pt-[96px] pb-10 px-6 overflow-y-auto flex flex-col items-center gap-4">
          {NAV_GAMES.map((game) => (
            <Link
              key={game.id}
              to={game.route}
              className="flex w-full max-w-sm items-center gap-4 rounded-pill border border-line bg-surface px-4 py-3 font-display text-xl text-ink"
              onClick={() => setMobileOpen(false)}
            >
              <span
                className="w-9 h-9 rounded-full flex items-center justify-center font-pixel text-base text-accent-foreground"
                style={{ backgroundColor: game.color }}
              >
                {game.id === '2048' ? '2' : game.title[0]}
              </span>
              {game.title}
            </Link>
          ))}
          <Link
            to="/2048"
            className="btn btn-primary mt-2 px-8 py-3.5 text-lg"
            onClick={() => setMobileOpen(false)}
          >
            Play now
          </Link>
        </div>
      )}
    </>
  );
}
