import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SHOWCASE_CARDS } from '../data/showcaseData';
import { CometCard } from './CometCard';
import { cn } from '../lib/utils';

export const CarouselShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const totalCards = SHOWCASE_CARDS.length;
  const currentCard = SHOWCASE_CARDS[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen w-full px-4 py-8 overflow-hidden bg-[#050505] text-[#f9fafb]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Centered Ambient Lighting Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#111111_0%,#050505_100%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.1)_0%,transparent_70%)]" />
      </div>

      {/* Main Focus Stage: Auto-looping Comet Card */}
      <div className="relative z-20 w-full max-w-sm flex items-center justify-center my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 0.94, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.94, x: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full"
          >
            <CometCard
              card={currentCard}
              isActive={true}
              leaningSpeed={4.5}
              leaningAngle={14}
              isAutoLeaningEnabled={true}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Carousel Controls */}
      <div className="relative z-20 w-full max-w-xs mt-6 flex items-center justify-between px-2">
        <button
          id="carousel-prev-btn"
          onClick={handlePrev}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#121212] border border-[#222] text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#1a1a1a] active:scale-95 transition-all shadow-lg cursor-pointer"
          aria-label="Previous card"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Minimal Navigation Dots */}
        <div className="flex items-center gap-2">
          {SHOWCASE_CARDS.map((item, idx) => (
            <button
              key={item.id}
              id={`carousel-dot-${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'h-2 rounded-full transition-all duration-300 cursor-pointer',
                idx === currentIndex
                  ? 'w-6 bg-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.8)]'
                  : 'w-2 bg-[#333] hover:bg-[#555]'
              )}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          id="carousel-next-btn"
          onClick={handleNext}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#121212] border border-[#222] text-[#9ca3af] hover:text-[#f9fafb] hover:bg-[#1a1a1a] active:scale-95 transition-all shadow-lg cursor-pointer"
          aria-label="Next card"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
