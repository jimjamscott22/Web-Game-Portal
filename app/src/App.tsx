import { useRef, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import NavigationBar from '@/components/NavigationBar';
import FloatingBackground from '@/components/FloatingBackground';
import PageTransitionOverlay, { type TransitionRef } from '@/components/PageTransitionOverlay';
import Home from '@/pages/Home';

const Game2048 = lazy(() => import('@/pages/Game2048'));
const GameMinesweeper = lazy(() => import('@/pages/GameMinesweeper'));
const GameSnake = lazy(() => import('@/pages/GameSnake'));
const GameTetris = lazy(() => import('@/pages/GameTetris'));
const GameSudoku = lazy(() => import('@/pages/GameSudoku'));
const GameBinairo = lazy(() => import('@/pages/GameBinairo'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  const transitionRef = useRef<TransitionRef>(null);

  return (
    <div className="relative min-h-screen">
      <FloatingBackground />
      <NavigationBar />
      <PageTransitionOverlay ref={transitionRef} />
      <ScrollToTop />

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="font-pixel text-2xl text-dark animate-pulse">Loading...</div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home transitionRef={transitionRef} />} />
          <Route path="/2048" element={<Game2048 />} />
          <Route path="/minesweeper" element={<GameMinesweeper />} />
          <Route path="/snake" element={<GameSnake />} />
          <Route path="/tetris" element={<GameTetris />} />
          <Route path="/sudoku" element={<GameSudoku />} />
          <Route path="/binairo" element={<GameBinairo />} />
        </Routes>
      </Suspense>
    </div>
  );
}
