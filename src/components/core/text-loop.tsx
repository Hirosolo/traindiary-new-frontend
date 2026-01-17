'use client';

import { AnimatePresence, motion, Transition, Variants } from 'motion/react';
import React, { useState, useEffect, Children, useCallback } from 'react';

interface TextLoopProps {
  children: React.ReactNode;
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
}

export function TextLoop({
  children,
  className = '',
  interval = 3000,
  transition = { duration: 0.3 },
  variants,
  onIndexChange,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);

  const handleIndexChange = useCallback(
    (newIndex: number) => {
      setCurrentIndex(newIndex);
      onIndexChange?.(newIndex);
    },
    [onIndexChange]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      handleIndexChange((currentIndex + 1) % items.length);
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, interval, items.length, handleIndexChange]);

  const defaultVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  const motionVariants = variants || defaultVariants;

  return (
    <div className={`relative inline-block ${className}`}>
      <AnimatePresence mode='wait' initial={false}>
        <motion.div
          key={currentIndex}
          initial='initial'
          animate='animate'
          exit='exit'
          transition={transition}
          variants={motionVariants}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
