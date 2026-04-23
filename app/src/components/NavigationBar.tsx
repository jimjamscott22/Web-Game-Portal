import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { NAV_GAMES } from '@/types';

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
        className={`fixed top-0 left-0 right-0 h-[72px] bg-white border-b-[3px] border-dark z-[100] transition-shadow duration-300 ${
          scrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.08)]' : ''
        }`}
      >
        <div className="max-w-[1400px] mx-auto h-full flex items-center justify-between px-6 lg:px-20">
          <Link to="/" className="flex items-center gap-0 shrink-0">
            <span className="font-pixel text-2xl font-bold text-dark tracking-tight">PIXEL</span>
            <span className="font-pixel text-2xl font-bold text-accent tracking-tight">PLAY</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_GAMES.map((game) => (
              <Link
                key={game.id}
                to={game.route}
                className="group relative font-body text-base font-medium text-dark transition-colors duration-200 hover:text-dark"
              >
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200"
                  style={{ backgroundColor: game.color }}
                />
                <span className="relative">
                  {game.title}
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-0.5 transition-all duration-200"
                    style={{ backgroundColor: game.color }}
                  />
                </span>
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Link
              to={isHome ? '/2048' : location.pathname}
              className="font-pixel text-base font-semibold text-white bg-accent px-6 py-2.5 rounded-pill border-[3px] border-dark shadow-button hover:shadow-button-hover hover:bg-[#F99ABC] active:shadow-button-active active:translate-y-1 btn-bounce inline-block"
            >
              Play Now
            </Link>
          </div>

          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <span className={`w-5 h-[3px] bg-dark transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[9px]' : ''}`} />
            <span className={`w-5 h-[3px] bg-dark transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`w-5 h-[3px] bg-dark transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[9px]' : ''}`} />
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 bg-white z-[150] pt-[72px] flex flex-col items-center justify-center gap-6">
          {NAV_GAMES.map((game) => (
            <Link
              key={game.id}
              to={game.route}
              className="flex items-center gap-4 text-2xl font-pixel font-semibold text-dark"
              onClick={() => setMobileOpen(false)}
            >
              <span className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg" style={{ backgroundColor: game.color }}>
                {game.id === '2048' ? '2' : game.id[0].toUpperCase()}
              </span>
              {game.title}
            </Link>
          ))}
          <Link
            to="/2048"
            className="mt-4 font-pixel text-lg font-semibold text-white bg-accent px-8 py-3 rounded-pill border-[3px] border-dark shadow-button"
            onClick={() => setMobileOpen(false)}
          >
            Play Now
          </Link>
        </div>
      )}
    </>
  );
}
