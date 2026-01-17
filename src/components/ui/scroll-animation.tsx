"use client";

import { useRef, ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  MotionValue,
} from "framer-motion";

// ============================================
// Scroll Progress Indicator
// ============================================
interface ScrollProgressProps {
  color?: string;
  height?: number;
  position?: "top" | "bottom";
}

export function ScrollProgress({
  color = "#3b82f6",
  height = 3,
  position = "top",
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className={`fixed left-0 right-0 z-[100] origin-left ${
        position === "top" ? "top-0" : "bottom-0"
      }`}
      style={{
        scaleX,
        height,
        backgroundColor: color,
      }}
    />
  );
}

// ============================================
// Slide & Rotate In
// ============================================
interface SlideRotateInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "right";
  rotation?: number;
}

export function SlideRotateIn({
  children,
  className = "",
  delay = 0,
  direction = "left",
  rotation = 12,
}: SlideRotateInProps) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: direction === "left" ? -100 : 100,
        rotate: direction === "left" ? -rotation : rotation,
      }}
      whileInView={{
        opacity: 1,
        x: 0,
        rotate: 0,
      }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Flip In Animation
// ============================================
interface FlipInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "x" | "y";
}

export function FlipIn({
  children,
  className = "",
  delay = 0,
  direction = "x",
}: FlipInProps) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        rotateX: direction === "x" ? 90 : 0,
        rotateY: direction === "y" ? 90 : 0,
        transformPerspective: 1000,
      }}
      whileInView={{
        opacity: 1,
        rotateX: 0,
        rotateY: 0,
      }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Bounce In Animation
// ============================================
interface BounceInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function BounceIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: BounceInProps) {
  const getInitial = () => {
    switch (direction) {
      case "up": return { y: 80 };
      case "down": return { y: -80 };
      case "left": return { x: 80 };
      case "right": return { x: -80 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.3, ...getInitial() }}
      whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay,
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Elastic Scale Animation
// ============================================
interface ElasticScaleProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ElasticScale({
  children,
  className = "",
  delay = 0,
}: ElasticScaleProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        delay,
        type: "spring",
        stiffness: 150,
        damping: 12,
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Glitch Text Effect
// ============================================
interface GlitchTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function GlitchText({
  children,
  className = "",
  delay = 0,
}: GlitchTextProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ delay }}
    >
      <motion.div
        animate={{
          x: [0, -3, 3, -2, 2, 0],
          opacity: [1, 0.8, 1, 0.9, 1],
        }}
        transition={{
          duration: 0.5,
          delay: delay + 0.2,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ============================================
// Split Text Animation (Character by Character)
// ============================================
interface SplitTextProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  staggerDelay?: number;
  animation?: "wave" | "cascade" | "random" | "bounce";
}

export function SplitText({
  text,
  className = "",
  charClassName = "",
  delay = 0,
  staggerDelay = 0.03,
  animation = "wave",
}: SplitTextProps) {
  const getVariants = () => {
    switch (animation) {
      case "wave":
        return {
          hidden: { y: 50, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        };
      case "cascade":
        return {
          hidden: { y: -50, opacity: 0, rotateX: 90 },
          visible: { y: 0, opacity: 1, rotateX: 0 },
        };
      case "random":
        return {
          hidden: { opacity: 0, scale: 0, rotate: Math.random() * 360 },
          visible: { opacity: 1, scale: 1, rotate: 0 },
        };
      case "bounce":
        return {
          hidden: { y: 100, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        };
    }
  };

  const variants = getVariants();

  return (
    <motion.span
      className={`inline-block ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className={`inline-block ${charClassName}`}
          variants={variants}
          transition={{
            duration: animation === "bounce" ? 0.5 : 0.4,
            delay: delay + i * staggerDelay,
            type: animation === "bounce" ? "spring" : "tween",
            stiffness: animation === "bounce" ? 300 : undefined,
            damping: animation === "bounce" ? 10 : undefined,
            ease: animation !== "bounce" ? [0.25, 0.1, 0.25, 1] : undefined,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ============================================
// Morphing Border Animation
// ============================================
interface MorphBorderProps {
  children: ReactNode;
  className?: string;
  borderColor?: string;
}

export function MorphBorder({
  children,
  className = "",
  borderColor = "#3b82f6",
}: MorphBorderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ 
          clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
        }}
        animate={isInView ? {
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        } : {}}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ border: `2px solid ${borderColor}` }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// Typewriter Effect
// ============================================
interface TypewriterProps {
  text: string;
  className?: string;
  delay?: number;
  speed?: number;
}

export function Typewriter({
  text,
  className = "",
  delay = 0,
  speed = 0.05,
}: TypewriterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <span ref={ref} className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{
            duration: 0.01,
            delay: delay + i * speed,
          }}
        >
          {char}
        </motion.span>
      ))}
      <motion.span
        className="inline-block w-[2px] h-[1em] bg-primary ml-1"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </span>
  );
}

// ============================================
// 3D Card Tilt on Scroll
// ============================================
interface Card3DProps {
  children: ReactNode;
  className?: string;
}

export function Card3D({ children, className = "" }: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [15, 0, -15]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5, 1], [-5, 0, 5]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        scale,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Magnetic Hover + Scroll Effect
// ============================================
interface MagneticProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export function Magnetic({
  children,
  className = "",
  strength = 0.3,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    ref.current.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) {
      ref.current.style.transform = "translate(0px, 0px)";
    }
  };

  return (
    <motion.div
      ref={ref}
      className={`transition-transform duration-300 ease-out ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Skew On Scroll
// ============================================
interface SkewOnScrollProps {
  children: ReactNode;
  className?: string;
  maxSkew?: number;
}

export function SkewOnScroll({
  children,
  className = "",
  maxSkew = 5,
}: SkewOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const skewY = useTransform(scrollYProgress, [0, 0.5, 1], [maxSkew, 0, -maxSkew]);
  const springSkew = useSpring(skewY, { stiffness: 100, damping: 30 });

  return (
    <motion.div ref={ref} className={className} style={{ skewY: springSkew }}>
      {children}
    </motion.div>
  );
}

// ============================================
// Fade In On Scroll
// ============================================
interface FadeInOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  threshold?: number;
  once?: boolean;
}

export function FadeInOnScroll({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  direction = "up",
  distance = 50,
  threshold = 0.1,
  once = true,
}: FadeInOnScrollProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance, x: 0 };
      case "down":
        return { y: -distance, x: 0 };
      case "left":
        return { x: distance, y: 0 };
      case "right":
        return { x: -distance, y: 0 };
      case "none":
        return { x: 0, y: 0 };
    }
  };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...getInitialPosition() }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: threshold }}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Parallax Container
// ============================================
interface ParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "vertical" | "horizontal";
}

export function Parallax({
  children,
  className = "",
  speed = 0.5,
  direction = "vertical",
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);
  const x = useTransform(scrollYProgress, [0, 1], [100 * speed, -100 * speed]);

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const springY = useSpring(y, springConfig);
  const springX = useSpring(x, springConfig);

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        style={direction === "vertical" ? { y: springY } : { x: springX }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ============================================
// Scale On Scroll
// ============================================
interface ScaleOnScrollProps {
  children: ReactNode;
  className?: string;
  startScale?: number;
  endScale?: number;
}

export function ScaleOnScroll({
  children,
  className = "",
  startScale = 0.8,
  endScale = 1,
}: ScaleOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [startScale, endScale]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  
  const springScale = useSpring(scale, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ scale: springScale, opacity }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Reveal On Scroll (Clip Path Animation)
// ============================================
interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right" | "top" | "bottom";
  delay?: number;
}

export function RevealOnScroll({
  children,
  className = "",
  direction = "left",
  delay = 0,
}: RevealOnScrollProps) {
  const getClipPath = () => {
    switch (direction) {
      case "left":
        return {
          initial: "inset(0 100% 0 0)",
          animate: "inset(0 0% 0 0)",
        };
      case "right":
        return {
          initial: "inset(0 0 0 100%)",
          animate: "inset(0 0 0 0%)",
        };
      case "top":
        return {
          initial: "inset(0 0 100% 0)",
          animate: "inset(0 0 0% 0)",
        };
      case "bottom":
        return {
          initial: "inset(100% 0 0 0)",
          animate: "inset(0% 0 0 0)",
        };
    }
  };

  const clipPaths = getClipPath();

  return (
    <motion.div
      className={className}
      initial={{ clipPath: clipPaths.initial, opacity: 0 }}
      whileInView={{ clipPath: clipPaths.animate, opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Text Scroll Reveal (Word by Word)
// ============================================
interface TextScrollRevealProps {
  text: string;
  className?: string;
  wordClassName?: string;
}

export function TextScrollReveal({
  text,
  className = "",
  wordClassName = "",
}: TextScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.25"],
  });

  const words = text.split(" ");

  return (
    <div ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word
            key={i}
            progress={scrollYProgress}
            range={[start, end]}
            className={wordClassName}
          >
            {word}
          </Word>
        );
      })}
    </div>
  );
}

interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  className?: string;
}

function Word({ children, progress, range, className }: WordProps) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  const y = useTransform(progress, range, [10, 0]);

  return (
    <motion.span
      className={`inline-block mr-2 ${className}`}
      style={{ opacity, y }}
    >
      {children}
    </motion.span>
  );
}

// ============================================
// Horizontal Scroll Section
// ============================================
interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}

export function HorizontalScroll({
  children,
  className = "",
  containerClassName = "",
}: HorizontalScrollProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <section ref={targetRef} className={`relative h-[300vh] ${containerClassName}`}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div className={`flex gap-8 ${className}`} style={{ x }}>
          {children}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// Stagger Children On Scroll
// ============================================
interface StaggerOnScrollProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function StaggerOnScroll({
  children,
  className = "",
  staggerDelay = 0.1,
  direction = "up",
}: StaggerOnScrollProps) {
  const getDirection = () => {
    switch (direction) {
      case "up":
        return { y: 30 };
      case "down":
        return { y: -30 };
      case "left":
        return { x: 30 };
      case "right":
        return { x: -30 };
    }
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {Array.isArray(children)
        ? children.map((child, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, ...getDirection() },
                visible: {
                  opacity: 1,
                  x: 0,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1],
                  },
                },
              }}
            >
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}

// ============================================
// Counter Animation On Scroll
// ============================================
interface CounterOnScrollProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  duration?: number;
  decimals?: number;
}

export function CounterOnScroll({
  value,
  suffix = "",
  prefix = "",
  className = "",
  duration = 2,
  decimals = 0,
}: CounterOnScrollProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "start 0.5"],
  });

  const count = useTransform(scrollYProgress, [0, 1], [0, value]);
  const springCount = useSpring(count, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.span ref={ref} className={className}>
      {prefix}
      <motion.span>
        {useTransform(springCount, (latest) =>
          latest.toFixed(decimals)
        ) as unknown as ReactNode}
      </motion.span>
      {suffix}
    </motion.span>
  );
}

// ============================================
// Blur In On Scroll
// ============================================
interface BlurInOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function BlurInOnScroll({
  children,
  className = "",
  delay = 0,
}: BlurInOnScrollProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, filter: "blur(20px)" }}
      whileInView={{ opacity: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// Rotate On Scroll
// ============================================
interface RotateOnScrollProps {
  children: ReactNode;
  className?: string;
  startRotation?: number;
  endRotation?: number;
}

export function RotateOnScroll({
  children,
  className = "",
  startRotation = -10,
  endRotation = 0,
}: RotateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [startRotation, endRotation, -startRotation]
  );

  return (
    <motion.div ref={ref} className={className} style={{ rotate }}>
      {children}
    </motion.div>
  );
}

// ============================================
// Floating Elements
// ============================================
interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  frequency?: number;
}

export function FloatingElement({
  children,
  className = "",
  amplitude = 20,
  frequency = 3,
}: FloatingElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, amplitude, 0, -amplitude, 0]
  );

  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
