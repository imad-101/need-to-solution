"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts up to `value`. The server and first client render show the final number (no hydration
 * mismatch, readable without JS); after mount it animates from 0, then from the previous value on changes.
 */
export function CountUp({ value, duration = 1200, className }: { value: number; duration?: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const a = from.current;
    const b = value;
    if (reduce || a === b) {
      from.current = b;
      setShown(b);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(a + (b - a) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = b;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = b;
    };
  }, [value, duration]);

  return <span className={className}>{shown.toLocaleString("en-US")}</span>;
}
