import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/** Parse a display value like "200+", "98%", "4.9/5", "5+", "Top 1%" */
function parse(val: string): { prefix: string; num: number; suffix: string; skip: boolean } {
  // Value starting with a non-digit word (e.g. "Top 1%") → skip counting
  if (/^[A-Za-z]/.test(val)) return { prefix: "", num: 0, suffix: val, skip: true };
  const m = val.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
  if (!m) return { prefix: "", num: 0, suffix: val, skip: true };
  return { prefix: m[1], num: parseFloat(m[2]), suffix: m[3], skip: false };
}

interface CountUpProps {
  value: string;
  className?: string;
  duration?: number;
}

export function CountUp({ value, className, duration = 1800 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState<string>("0");
  const { prefix, num, suffix, skip } = parse(value);
  const isDecimal = num % 1 !== 0;

  useEffect(() => {
    if (!inView || skip) { setDisplay(value); return; }
    const start = Date.now();
    let rafId: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      const current = num * eased;
      setDisplay(`${prefix}${isDecimal ? current.toFixed(1) : Math.round(current)}${suffix}`);
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };
    setDisplay(`${prefix}0${suffix}`);
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [inView, skip, num, prefix, suffix, duration, isDecimal, value]);

  return <span ref={ref} className={className}>{inView || skip ? display : `${prefix}0${suffix}`}</span>;
}
