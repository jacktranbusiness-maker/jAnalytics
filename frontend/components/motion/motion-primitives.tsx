"use client";

import * as React from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  type Variants,
} from "framer-motion";

import { cn } from "@/lib/utils";

// Springy easing reused across the dashboard for cohesive micro-animations.
export const easeSpring = {
  type: "spring",
  stiffness: 260,
  damping: 24,
} as const;

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: easeSpring },
};

export const staggerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { ...easeSpring, delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={staggerVariants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={fadeUpVariants}>
      {children}
    </motion.div>
  );
}

/**
 * Animated number that counts up to `value` the first time it scrolls into
 * view. `format` renders the displayed string.
 */
export function CountUp({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 90, damping: 20 });
  const [display, setDisplay] = React.useState(() => format(0));

  React.useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  React.useEffect(() => {
    const unsub = spring.on("change", (latest) => setDisplay(format(latest)));
    return () => unsub();
  }, [spring, format]);

  return (
    <span ref={ref} className={cn(className)}>
      {display}
    </span>
  );
}

export { motion };
