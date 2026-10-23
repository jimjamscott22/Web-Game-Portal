import { useRef, useEffect } from 'react';

export function useGameLoop(
  callback: (delta: number) => void,
  isRunning: boolean,
  fps: number = 60
) {
  const callbackRef = useRef(callback);
  const isRunningRef = useRef(isRunning);
  const lastTimeRef = useRef<number>(0);
  const accumulatorRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => { callbackRef.current = callback; }, [callback]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);

  useEffect(() => {
    function tick(time: number) {
      if (!isRunningRef.current) {
        lastTimeRef.current = time;
        accumulatorRef.current = 0;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;
      accumulatorRef.current += delta;

      const frameInterval = 1000 / fps;
      while (accumulatorRef.current >= frameInterval) {
        callbackRef.current(frameInterval);
        accumulatorRef.current -= frameInterval;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fps]);
}
