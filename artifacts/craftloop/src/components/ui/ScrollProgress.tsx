import { motion, useScroll, useSpring } from "framer-motion";

/** Thin rainbow progress bar fixed at the very top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[200] origin-left pointer-events-none"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 50%, #EC4899 100%)",
      }}
    />
  );
}
