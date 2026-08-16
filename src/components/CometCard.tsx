import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RotateCcw, Film, Eye, Heart } from 'lucide-react';
import { ShowcaseCardItem } from '../types';
import { cn } from '../lib/utils';

interface CometCardProps {
  card: ShowcaseCardItem;
  isActive?: boolean;
  onSelect?: () => void;
  leaningSpeed?: number;
  leaningAngle?: number;
  isAutoLeaningEnabled?: boolean;
}

export const CometCard: React.FC<CometCardProps> = ({
  card,
  isActive = true,
  onSelect,
  leaningSpeed = 4.5,
  leaningAngle = 14,
  isAutoLeaningEnabled = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [showResetFeedback, setShowResetFeedback] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(1890);

  // Sync video play/pause & reset
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Playback interrupted or prevented:', err);
          setIsPlaying(false);
        });
      }
    } else {
      video.pause();
    }
  }, [isPlaying]);

  // Pause and reset if card is no longer active in carousel
  useEffect(() => {
    if (!isActive && isPlaying) {
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive, isPlaying]);

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-stop-propagation="true"]')) {
      return;
    }
    if (hasError) return;

    if (onSelect) {
      onSelect();
    }

    if (isPlaying) {
      // Tap while playing: RESETS video
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setShowResetFeedback(true);
      setTimeout(() => {
        setShowResetFeedback(false);
      }, 500);
    } else {
      // Tap while paused/stopped: PLAYS video
      if (videoRef.current && videoRef.current.currentTime !== 0) {
        videoRef.current.currentTime = 0;
      }
      setIsPlaying(true);
    }
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  return (
    <div
      ref={containerRef}
      id={`comet-card-wrapper-${card.id}`}
      className="relative w-full max-w-[280px] sm:max-w-[310px] mx-auto select-none [perspective:1200px]"
    >
      {/* Motion Card with Auto-Leaning Loop (Left to Right) */}
      <motion.div
        id={`comet-card-tilt-${card.id}`}
        animate={
          isAutoLeaningEnabled
            ? {
                rotateY: [-leaningAngle, leaningAngle],
                rotateX: [3, -3],
                rotateZ: [-1.5, 1.5],
                x: [-6, 6],
                y: [-2, 2],
              }
            : {
                rotateY: 0,
                rotateX: 0,
                rotateZ: 0,
                x: 0,
                y: 0,
              }
        }
        transition={{
          duration: leaningSpeed,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
        onClick={handleCardClick}
        className="group relative cursor-pointer rounded-[24px] p-[1.5px] transition-shadow duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(59,130,246,0.25)]"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Outer ambient blur glow */}
        <div className="absolute -inset-[2px] rounded-[26px] bg-gradient-to-br from-blue-500/40 via-transparent to-blue-600/30 opacity-70 blur-md transition-opacity duration-500 group-hover:opacity-100" />

        {/* Rotating Conic Comet Trail */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]">
          <div className="absolute -inset-[100%] animate-comet-spin bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_260deg,rgba(59,130,246,0.85)_325deg,rgba(255,255,255,0.95)_355deg,transparent_360deg)] opacity-90" />
        </div>

        {/* Inner Card Container with 9:14 Portrait Aspect Ratio */}
        <div className="relative z-10 aspect-[9/14] w-full flex flex-col overflow-hidden rounded-[23px] bg-[#121212] border border-white/10 text-[#f9fafb] shadow-2xl">
          {/* Native HTML5 Video Element Viewport */}
          <div className="relative flex-1 w-full overflow-hidden bg-black">
            <video
              ref={videoRef}
              src={card.videoUrl}
              playsInline
              loop
              muted
              preload="metadata"
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => {
                setIsBuffering(false);
                setIsPlaying(true);
              }}
              onError={() => {
                setHasError(true);
                setIsBuffering(false);
              }}
              className={cn(
                'h-full w-full object-cover transition-transform duration-700',
                isPlaying ? 'scale-100 opacity-100' : 'scale-105 opacity-90 filter brightness-95'
              )}
            />

            {/* Shimmer sweep animation */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer" />
            </div>

            {/* Minimal Play Trigger Overlay when not playing */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"
                >
                  <motion.div
                    initial={{ scale: 0.85 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.85 }}
                    className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#3b82f6] shadow-[0_0_30px_rgba(59,130,246,0.7)] ring-4 ring-white/15"
                  >
                    <div className="absolute inset-0 rounded-full animate-ping bg-blue-400/30 duration-1000" />
                    <Play className="ml-1 h-6 w-6 fill-white text-white drop-shadow" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Brief Reset Flash Animation on Tap to Reset */}
            <AnimatePresence>
              {showResetFeedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                    <RotateCcw className="h-5 w-5 animate-spin" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buffering Indicator */}
            {isBuffering && isPlaying && (
              <div className="absolute inset-0 z-25 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#3b82f6] border-t-transparent" />
              </div>
            )}

            {/* Error Fallback */}
            {hasError && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#121212]/95 p-4 text-center text-xs text-red-300">
                <Film className="mb-2 h-5 w-5 text-red-400" />
                <span>Unable to load video</span>
              </div>
            )}
          </div>

          {/* ================= DIVIDER + SELECTION BAR BELOW ON CARD ================= */}
          <div className="p-3 bg-[#121212] border-t border-[#222] flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <img
                src={card.author.avatar}
                alt={card.author.name}
                className="h-6 w-6 rounded-full object-cover ring-1 ring-[#3b82f6]/40"
                referrerPolicy="no-referrer"
              />
              <div className="text-[11px]">
                <span className="font-medium text-[#f9fafb] block leading-none">
                  {card.author.name}
                </span>
                <span className="text-[10px] text-[#9ca3af] leading-tight">
                  {card.author.role}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-[#9ca3af]">
              <div className="flex items-center gap-1 text-[11px]">
                <Eye className="h-3 w-3 text-[#9ca3af]/80" />
                <span>{card.metrics?.views || '24K'}</span>
              </div>
              <button
                data-stop-propagation="true"
                onClick={toggleLike}
                className={cn(
                  'flex items-center gap-1 text-[11px] transition-colors cursor-pointer',
                  liked ? 'text-rose-400' : 'text-[#9ca3af] hover:text-[#f9fafb]'
                )}
                aria-label="Like"
              >
                <Heart
                  className={cn('h-3 w-3', liked && 'fill-rose-400 text-rose-400')}
                />
                <span>{likeCount.toLocaleString()}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
