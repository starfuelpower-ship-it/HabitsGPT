import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useCompanion, CAT_COLORS, CatColor, CatPattern } from '@/contexts/CompanionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSoundEffects, getRandomTapSound, getHabitCompleteSound } from '@/hooks/useSoundEffects';
import { useCatBehavior, CatState } from '@/hooks/useCatBehavior';
import { CatCostume } from './CatCostume';
import { cn } from '@/lib/utils';

const MIN_SCALE = 0.6;
const MAX_SCALE = 1.5;
const DEFAULT_SCALE = 1;

const CAT_POSITION_KEY = 'daily-reset-cat-position';
const CAT_SCALE_KEY = 'daily-reset-cat-scale';

const loadSavedPosition = () => {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  const saved = localStorage.getItem(CAT_POSITION_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { x: 0, y: 0 };
    }
  }
  return { x: 0, y: 0 };
};

const loadSavedScale = () => {
  if (typeof window === 'undefined') return DEFAULT_SCALE;
  const saved = localStorage.getItem(CAT_SCALE_KEY);
  if (saved) {
    const scale = parseFloat(saved);
    if (!isNaN(scale) && scale >= MIN_SCALE && scale <= MAX_SCALE) {
      return scale;
    }
  }
  return DEFAULT_SCALE;
};

export const CatCompanion = memo(() => {
  const { showCompanion, companionType, currentReaction, equippedCostume, catColor, catSize, catSoundsEnabled, catPattern, previewPattern } = useCompanion();
  const { resolvedTheme } = useTheme();
  const { playSound, triggerHaptic } = useSoundEffects();
  
  const [dragPosition, setDragPosition] = useState(loadSavedPosition);
  const [displayPosition, setDisplayPosition] = useState(loadSavedPosition);
  const [walkOffset, setWalkOffset] = useState(0);
  const [scale, setScale] = useState(loadSavedScale);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const initialPinchDistance = useRef<number>(0);
  const initialScale = useRef<number>(DEFAULT_SCALE);
  const lastMoveTime = useRef<number>(0);
  const lastMovePos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const targetPositionRef = useRef({ x: 0, y: 0 });

  const isDark = resolvedTheme === 'dark';
  const hasCustomPosition = dragPosition.x !== 0 || dragPosition.y !== 0;

  // Cat behavior state machine
  const { currentState, walkDirection, walkProgress, triggerTapReaction } = useCatBehavior({
    isDarkMode: isDark,
    isEnabled: showCompanion && companionType === 'cat',
    hasReaction: currentReaction,
    isDragging,
    hasCustomPosition,
  });

  // Handle walking animation offset
  useEffect(() => {
    if (currentState === 'walking' && walkDirection !== 0) {
      const targetOffset = walkDirection * 40;
      setWalkOffset((walkProgress / 100) * targetOffset);
      setFacingLeft(walkDirection < 0);
    } else if (currentState !== 'walking') {
      setWalkOffset(0);
    }
  }, [currentState, walkDirection, walkProgress]);

  // Smooth magnetic following during drag + soft inertia on release
  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = () => {
      const now = performance.now();
      const deltaTime = Math.min((now - lastTime) / 1000, 0.1); // Cap delta to prevent jumps
      lastTime = now;
      
      if (isDragging) {
        // Magnetic follow: smoothly interpolate toward target position
        const lerp = 0.25; // Smooth magnetic follow (0.25 = gentle, 0.5 = snappy)
        setDisplayPosition(prev => ({
          x: prev.x + (targetPositionRef.current.x - prev.x) * lerp,
          y: prev.y + (targetPositionRef.current.y - prev.y) * lerp,
        }));
      } else if (Math.abs(velocity.x) > 0.5 || Math.abs(velocity.y) > 0.5) {
        // Soft inertia: continue moving with friction when released
        const friction = 0.92; // Gentle slowdown
        const newVelX = velocity.x * friction;
        const newVelY = velocity.y * friction;
        
        const maxX = window.innerWidth - 60;
        const maxY = window.innerHeight - 140;
        
        setDisplayPosition(prev => {
          const newX = Math.min(maxX, Math.max(-maxX + 120, prev.x + newVelX * deltaTime * 60));
          const newY = Math.min(0, Math.max(-maxY, prev.y + newVelY * deltaTime * 60));
          return { x: newX, y: newY };
        });
        
        setVelocity({ x: newVelX, y: newVelY });
        
        // Stop when velocity is negligible
        if (Math.abs(newVelX) < 0.5 && Math.abs(newVelY) < 0.5) {
          setVelocity({ x: 0, y: 0 });
          setDragPosition(displayPosition);
          localStorage.setItem(CAT_POSITION_KEY, JSON.stringify(displayPosition));
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [isDragging, velocity, displayPosition]);

  // Sync display position when not dragging and no velocity
  useEffect(() => {
    if (!isDragging && velocity.x === 0 && velocity.y === 0) {
      setDisplayPosition(dragPosition);
    }
  }, [dragPosition, isDragging, velocity]);

  // Check if cat is in sleep mode
  const isCatSleeping = currentState === 'sleeping' || currentState === 'loaf' || 
    currentState === 'curl_up' || currentState === 'settle_down' || 
    currentState === 'twitch_dream' || currentState === 'snuggle' || currentState === 'paw_tuck';

  // Track last interaction time for idle purring
  const lastInteractionRef = useRef<number>(Date.now());
  const lastPurrTimeRef = useRef<number>(0);
  const purrAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Random purring when sleeping or idle
  useEffect(() => {
    if (!showCompanion || companionType !== 'cat' || !catSoundsEnabled) return;
    
    const purrInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceInteraction = now - lastInteractionRef.current;
      const timeSinceLastPurr = now - lastPurrTimeRef.current;
      const shouldPurr = isCatSleeping || timeSinceInteraction > 15000;
      
      if (shouldPurr && timeSinceLastPurr > 60000 && Math.random() < 0.4) {
        lastPurrTimeRef.current = now;
        const purrAudio = new Audio('/audio/cat-purr.mp3');
        purrAudio.volume = 0.15;
        purrAudioRef.current = purrAudio;
        purrAudio.play().catch(() => {});
        
        const purrDuration = 3000 + Math.random() * 1000;
        setTimeout(() => {
          if (purrAudioRef.current === purrAudio) {
            purrAudio.pause();
            purrAudio.currentTime = 0;
            purrAudioRef.current = null;
          }
        }, purrDuration);
      }
    }, 10000);
    
    return () => {
      clearInterval(purrInterval);
      if (purrAudioRef.current) {
        purrAudioRef.current.pause();
        purrAudioRef.current = null;
      }
    };
  }, [isCatSleeping, showCompanion, companionType, catSoundsEnabled]);

  // Play cat sounds for reactions
  useEffect(() => {
    if (isCatSleeping || !catSoundsEnabled) return;
    
    if (currentReaction === 'habit_complete') {
      playSound(getHabitCompleteSound());
    } else if (currentReaction === 'all_complete') {
      playSound('achievement');
      setTimeout(() => playSound('meow_happy'), 300);
    }
  }, [currentReaction, playSound, isCatSleeping, catSoundsEnabled]);

  // Handle tap on cat
  const handleCatTap = useCallback(() => {
    lastInteractionRef.current = Date.now();
    triggerTapReaction();
    playSound('soft_pop');
    if (!isCatSleeping && catSoundsEnabled) {
      setTimeout(() => playSound(getRandomTapSound()), 80);
    }
    triggerHaptic('light');
  }, [triggerTapReaction, playSound, triggerHaptic, isCatSleeping, catSoundsEnabled]);

  // Calculate velocity from movement
  const updateVelocity = useCallback((currentX: number, currentY: number) => {
    const now = performance.now();
    const dt = now - lastMoveTime.current;
    if (dt > 0 && dt < 100) {
      const vx = (currentX - lastMovePos.current.x) / dt * 16; // Normalize to ~60fps
      const vy = (currentY - lastMovePos.current.y) / dt * 16;
      setVelocity({ x: vx * 0.5, y: vy * 0.5 }); // Dampen initial velocity
    }
    lastMoveTime.current = now;
    lastMovePos.current = { x: currentX, y: currentY };
  }, []);

  // Touch handlers for dragging - with expanded hitbox logic built-in
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialPinchDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialScale.current = scale;
      setIsPinching(true);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setVelocity({ x: 0, y: 0 }); // Stop any ongoing inertia
      lastMoveTime.current = performance.now();
      lastMovePos.current = { x: touch.clientX, y: touch.clientY };
      
      // Calculate offset from cat center and set target directly
      targetPositionRef.current = { ...displayPosition };
      handleCatTap();
    }
  }, [scale, displayPosition, handleCatTap]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (isPinching && e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scaleChange = currentDistance / initialPinchDistance.current;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, initialScale.current * scaleChange));
      setScale(newScale);
    } else if (isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - lastMovePos.current.x;
      const deltaY = touch.clientY - lastMovePos.current.y;
      
      updateVelocity(touch.clientX, touch.clientY);
      
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 140;
      
      // Update target position directly based on delta (finger following)
      const newX = Math.min(maxX, Math.max(-maxX + 120, targetPositionRef.current.x + deltaX));
      const newY = Math.min(0, Math.max(-maxY, targetPositionRef.current.y + deltaY));
      
      targetPositionRef.current = { x: newX, y: newY };
      setDragPosition({ x: newX, y: newY });
      
      if (Math.abs(deltaX) > 2) {
        setFacingLeft(deltaX < 0);
      }
      
      lastMovePos.current = { x: touch.clientX, y: touch.clientY };
    }
  }, [isPinching, isDragging, updateVelocity]);

  const handleTouchEnd = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      // Velocity is already set from handleTouchMove - inertia will kick in
      if (velocity.x === 0 && velocity.y === 0) {
        localStorage.setItem(CAT_POSITION_KEY, JSON.stringify(displayPosition));
      }
    }
    setIsPinching(false);
    localStorage.setItem(CAT_SCALE_KEY, String(scale));
  }, [isDragging, displayPosition, scale, velocity]);

  // Mouse handlers for desktop - same smooth behavior
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setVelocity({ x: 0, y: 0 });
    lastMoveTime.current = performance.now();
    lastMovePos.current = { x: e.clientX, y: e.clientY };
    targetPositionRef.current = { ...displayPosition };
    handleCatTap();
  }, [displayPosition, handleCatTap]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMovePos.current.x;
    const deltaY = e.clientY - lastMovePos.current.y;
    
    updateVelocity(e.clientX, e.clientY);
    
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 140;
    
    const newX = Math.min(maxX, Math.max(-maxX + 120, targetPositionRef.current.x + deltaX));
    const newY = Math.min(0, Math.max(-maxY, targetPositionRef.current.y + deltaY));
    
    targetPositionRef.current = { x: newX, y: newY };
    setDragPosition({ x: newX, y: newY });
    
    if (Math.abs(deltaX) > 2) {
      setFacingLeft(deltaX < 0);
    }
    
    lastMovePos.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, updateVelocity]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (velocity.x === 0 && velocity.y === 0) {
        localStorage.setItem(CAT_POSITION_KEY, JSON.stringify(displayPosition));
      }
    }
  }, [isDragging, displayPosition, velocity]);

  // Mouse wheel for scaling on desktop
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
    setScale(newScale);
    localStorage.setItem(CAT_SCALE_KEY, String(newScale));
  }, [scale]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!showCompanion || companionType !== 'cat') return null;

  return (
    <>
      {/* Invisible overlay - pointer-events: none so it doesn't block UI */}
      <div 
        className="fixed inset-0 z-30 pointer-events-none"
        aria-hidden="true"
      >
        {/* Cat container with expanded hitbox for easier grabbing */}
        <div
          ref={containerRef}
          className={cn(
            'absolute bottom-24 right-4 select-none pointer-events-auto',
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          style={{
            transform: `translate(${walkOffset + displayPosition.x}px, ${displayPosition.y}px) scale(${scale * catSize})`,
            // Smooth transitions when not actively dragging
            transition: isDragging || isPinching || velocity.x !== 0 || velocity.y !== 0 
              ? 'none' 
              : currentState === 'walking' 
                ? 'transform 0.05s linear' 
                : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        >
          {/* Expanded invisible hitbox - 24px padding around the cat for easier grabbing */}
          <div 
            className="absolute -inset-6 rounded-full"
            aria-hidden="true"
          />
          <div
            className={cn(
              'relative w-16 h-16',
              facingLeft && 'scale-x-[-1]'
            )}
            style={{ transition: 'transform 0.15s ease-out' }}
          >
            <CatBody 
              state={currentState} 
              isDark={isDark} 
              costume={equippedCostume}
              catColor={catColor}
              catPattern={previewPattern || catPattern}
            />
          </div>
        </div>
      </div>
      
      <CatStyles />
    </>
  );
});

CatCompanion.displayName = 'CatCompanion';

// Separate component for the cat body SVG to optimize renders
interface CatBodyProps {
  state: CatState;
  isDark: boolean;
  costume: string;
  catColor: CatColor;
  catPattern: CatPattern;
}

const CatBody = memo(({ state, isDark, costume, catColor, catPattern }: CatBodyProps) => {
  const colorData = CAT_COLORS[catColor];
  // In dark mode, use gray tones for better visibility unless user explicitly chose a color
  const bodyColor = isDark && catColor === 'default' ? '#9ca3af' : colorData.body;
  const bodyColorDark = isDark && catColor === 'default' ? '#6b7280' : colorData.bodyDark;
  const innerEarColor = isDark && catColor === 'default' ? '#6b7280' : colorData.innerEar;
  const eyeColor = '#1f2937';
  const noseColor = '#f472b6';
  const whiskerColor = isDark ? '#6b7280' : '#fbbf24';
  
  // Animation class mappings
  const stateStr = state as string;
  
  const bodyClass = cn(
    'cat-body',
    stateStr === 'stretching' && 'animate-cat-stretch',
    stateStr === 'playful' && 'animate-cat-playful',
    stateStr === 'tap_reaction' && 'animate-cat-hop',
    stateStr === 'tap_bounce' && 'animate-cat-bounce',
    stateStr === 'tap_spin' && 'animate-cat-spin',
    stateStr === 'tap_meow' && 'animate-cat-meow-body',
    stateStr === 'tap_curious' && 'animate-cat-curious',
    stateStr === 'sleeping' && 'animate-cat-curl',
    stateStr === 'loaf' && 'animate-cat-loaf',
    stateStr === 'tap_love' && 'animate-cat-love',
    stateStr === 'tap_roll' && 'animate-cat-roll',
    stateStr === 'tap_shake' && 'animate-cat-shake',
    stateStr === 'tap_wave' && 'animate-cat-wave',
    stateStr === 'tap_jump' && 'animate-cat-jump',
    stateStr === 'pounce_ready' && 'animate-cat-pounce-ready',
    stateStr === 'pounce' && 'animate-cat-pounce',
    stateStr === 'knead' && 'animate-cat-knead',
    stateStr === 'belly_up' && 'animate-cat-belly-up',
    stateStr === 'sit_tall' && 'animate-cat-sit-tall',
    stateStr === 'crouch' && 'animate-cat-crouch',
    stateStr === 'startled' && 'animate-cat-startled',
    stateStr === 'happy_dance' && 'animate-cat-happy-dance',
    stateStr === 'tail_chase' && 'animate-cat-tail-chase',
    stateStr === 'idle_yawn' && 'animate-cat-yawn',
    // New lifelike animations
    stateStr === 'curious_walk' && 'animate-cat-curious-walk',
    stateStr === 'settle_down' && 'animate-cat-settle',
    stateStr === 'curl_up' && 'animate-cat-curl-up',
    stateStr === 'bat_at_air' && 'animate-cat-bat',
    stateStr === 'watch_something' && 'animate-cat-watch',
    stateStr === 'flop_over' && 'animate-cat-flop',
    stateStr === 'twitch_dream' && 'animate-cat-dream-twitch',
    stateStr === 'wake_stretch' && 'animate-cat-wake-stretch',
    stateStr === 'snuggle' && 'animate-cat-snuggle',
    stateStr === 'lazy_roll' && 'animate-cat-lazy-roll',
    stateStr === 'paw_tuck' && 'animate-cat-paw-tuck',
  );
  
  const headClass = cn(
    'cat-head',
    stateStr === 'tap_reaction' && 'animate-cat-head-tilt',
    stateStr === 'tap_curious' && 'animate-cat-head-curious',
    stateStr === 'tap_meow' && 'animate-cat-head-meow',
    stateStr === 'grooming' && 'animate-cat-head-down',
    stateStr === 'idle_look_left' && 'animate-cat-look-left',
    stateStr === 'idle_look_right' && 'animate-cat-look-right',
    stateStr === 'idle_look_up' && 'animate-cat-look-up',
    stateStr === 'idle_sniff' && 'animate-cat-sniff',
    stateStr === 'head_shake' && 'animate-cat-head-shake',
    stateStr === 'tap_love' && 'animate-cat-head-love',
    stateStr === 'startled' && 'animate-cat-head-startled',
    stateStr === 'idle_yawn' && 'animate-cat-head-yawn',
    stateStr === 'head_tilt' && 'animate-cat-head-tilt-curious',
    stateStr === 'watch_something' && 'animate-cat-head-watch',
    stateStr === 'alert_ears' && 'animate-cat-head-alert',
  );
  
  const tailClass = cn(
    'cat-tail',
    stateStr === 'idle' && 'animate-cat-tail-idle',
    stateStr === 'playful' && 'animate-cat-tail-wag',
    stateStr === 'tap_reaction' && 'animate-cat-tail-wag',
    stateStr === 'tap_bounce' && 'animate-cat-tail-wag',
    stateStr === 'tap_spin' && 'animate-cat-tail-spin',
    stateStr === 'tap_curious' && 'animate-cat-tail-perk',
    stateStr === 'sleeping' && 'animate-cat-tail-wrap',
    stateStr === 'idle_tail_swish' && 'animate-cat-tail-swish',
    stateStr === 'happy_dance' && 'animate-cat-tail-excited',
    stateStr === 'pounce_ready' && 'animate-cat-tail-twitch',
    stateStr === 'startled' && 'animate-cat-tail-puff',
    stateStr === 'tap_love' && 'animate-cat-tail-heart',
    stateStr === 'tail_flick' && 'animate-cat-tail-flick',
    stateStr === 'watch_something' && 'animate-cat-tail-slow-swish',
    stateStr === 'curl_up' && 'animate-cat-tail-wrap',
  );

  const earClass = cn(
    stateStr === 'idle_ear_twitch' && 'animate-cat-ear-twitch',
    stateStr === 'startled' && 'animate-cat-ears-back',
    stateStr === 'tap_curious' && 'animate-cat-ears-forward',
    stateStr === 'alert_ears' && 'animate-cat-ears-alert',
    stateStr === 'watch_something' && 'animate-cat-ears-forward',
  );

  const whiskerClass = cn(
    stateStr === 'idle_whisker_twitch' && 'animate-cat-whisker-twitch',
    stateStr === 'idle_sniff' && 'animate-cat-whisker-sniff',
  );

  const pawClass = cn(
    stateStr === 'lick_paw' && 'animate-cat-lick-paw',
    stateStr === 'scratch_ear' && 'animate-cat-scratch',
    stateStr === 'knead' && 'animate-cat-knead-paw',
    stateStr === 'tap_wave' && 'animate-cat-wave-paw',
  );
  
  const isSleeping = stateStr === 'sleeping' || stateStr === 'loaf';
  const isBlinking = stateStr === 'blinking';
  // Cat opens mouth when meowing, chirping, trilling, or making any sound
  const isMeowing = stateStr === 'tap_meow' || stateStr === 'meow' || stateStr === 'chirp' || stateStr === 'trill';
  const isYawning = stateStr === 'idle_yawn';
  const isBellyUp = stateStr === 'belly_up';
  
  const eyesOpen = !isSleeping && !isBlinking && !isYawning;
  const eyesHappy = stateStr === 'playful' || stateStr === 'tap_reaction' || stateStr === 'tap_bounce' || stateStr === 'tap_love' || stateStr === 'happy_dance';
  const eyesWide = stateStr === 'tap_curious' || stateStr === 'tap_spin' || stateStr === 'startled' || stateStr === 'pounce_ready';
  const eyesNarrow = stateStr === 'pounce' || stateStr === 'crouch';

  return (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full"
      style={{
        filter: isDark ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
      }}
    >
      {/* Main cat group - costume will be positioned relative to this */}
      <g className={bodyClass}>
        {/* Tail - behind body */}
        <path
          d={isSleeping ? "M24 48 Q18 52 20 48 Q22 44 26 46" : "M46 42 Q56 38 54 28"}
          stroke={bodyColor}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          className={tailClass}
        />
        
        {/* Body */}
        <ellipse
          cx="32"
          cy={isSleeping ? '46' : '42'}
          rx={isSleeping ? '12' : '14'}
          ry={isSleeping ? '8' : '10'}
          fill={bodyColor}
          className={isSleeping ? 'animate-cat-breathe' : ''}
        />
        
        {/* Pattern overlays on body */}
        {catPattern !== 'none' && (
          <g className="cat-pattern" style={{ opacity: 0.6 }}>
            {catPattern === 'tabby' && (
              <>
                <path d={isSleeping ? "M24 44 Q28 42 32 44" : "M22 40 Q28 38 34 40"} stroke={bodyColorDark} strokeWidth="1.5" fill="none" />
                <path d={isSleeping ? "M26 46 Q30 44 36 46" : "M24 42 Q30 40 38 42"} stroke={bodyColorDark} strokeWidth="1.5" fill="none" />
                <path d={isSleeping ? "M28 48 Q32 46 38 48" : "M26 44 Q32 42 40 44"} stroke={bodyColorDark} strokeWidth="1.5" fill="none" />
              </>
            )}
            {catPattern === 'spots' && (
              <>
                <circle cx={isSleeping ? '26' : '24'} cy={isSleeping ? '44' : '40'} r="2" fill={bodyColorDark} />
                <circle cx={isSleeping ? '34' : '32'} cy={isSleeping ? '46' : '42'} r="1.5" fill={bodyColorDark} />
                <circle cx={isSleeping ? '38' : '38'} cy={isSleeping ? '44' : '40'} r="2" fill={bodyColorDark} />
                <circle cx={isSleeping ? '30' : '28'} cy={isSleeping ? '48' : '44'} r="1.5" fill={bodyColorDark} />
              </>
            )}
            {catPattern === 'tuxedo' && (
              <ellipse 
                cx="32" 
                cy={isSleeping ? '48' : '46'} 
                rx={isSleeping ? '6' : '7'} 
                ry={isSleeping ? '4' : '5'} 
                fill="#f9fafb" 
              />
            )}
            {catPattern === 'siamese' && (
              <>
                <ellipse cx="32" cy={isSleeping ? '46' : '42'} rx={isSleeping ? '12' : '14'} ry={isSleeping ? '8' : '10'} fill={bodyColorDark} style={{ opacity: 0.3 }} />
              </>
            )}
            {catPattern === 'tiger' && (
              <>
                <path d={isSleeping ? "M22 44 L24 48" : "M20 38 L22 44"} stroke={bodyColorDark} strokeWidth="2" strokeLinecap="round" />
                <path d={isSleeping ? "M28 43 L29 49" : "M26 37 L27 45"} stroke={bodyColorDark} strokeWidth="2" strokeLinecap="round" />
                <path d={isSleeping ? "M34 43 L35 49" : "M34 37 L35 45"} stroke={bodyColorDark} strokeWidth="2" strokeLinecap="round" />
                <path d={isSleeping ? "M40 44 L42 48" : "M40 38 L42 44"} stroke={bodyColorDark} strokeWidth="2" strokeLinecap="round" />
              </>
            )}
            {catPattern === 'tortie' && (
              <>
                <ellipse cx={isSleeping ? '26' : '24'} cy={isSleeping ? '44' : '40'} rx="4" ry="3" fill="#fb923c" style={{ opacity: 0.7 }} />
                <ellipse cx={isSleeping ? '38' : '38'} cy={isSleeping ? '46' : '42'} rx="3" ry="2" fill="#374151" style={{ opacity: 0.5 }} />
                <ellipse cx={isSleeping ? '32' : '30'} cy={isSleeping ? '48' : '44'} rx="3" ry="2" fill="#fb923c" style={{ opacity: 0.6 }} />
              </>
            )}
            {catPattern === 'bicolor' && (
              <ellipse 
                cx={isSleeping ? '38' : '40'} 
                cy={isSleeping ? '46' : '42'} 
                rx={isSleeping ? '8' : '10'} 
                ry={isSleeping ? '6' : '8'} 
                fill="#f9fafb" 
                style={{ opacity: 0.9 }}
              />
            )}
            {catPattern === 'van' && (
              <>
                <ellipse cx="32" cy={isSleeping ? '46' : '42'} rx={isSleeping ? '10' : '12'} ry={isSleeping ? '6' : '8'} fill="#f9fafb" style={{ opacity: 0.95 }} />
              </>
            )}
            {catPattern === 'hearts' && (
              <>
                <path d={isSleeping ? "M26 45 C24 43 26 41 28 43 C30 41 32 43 30 45 L28 47 Z" : "M24 41 C22 39 24 37 26 39 C28 37 30 39 28 41 L26 43 Z"} fill="#f472b6" style={{ opacity: 0.8 }} />
                <path d={isSleeping ? "M36 44 C35 43 36 42 37 43 C38 42 39 43 38 44 L37 45 Z" : "M36 40 C35 39 36 38 37 39 C38 38 39 39 38 40 L37 41 Z"} fill="#f472b6" style={{ opacity: 0.7 }} />
              </>
            )}
          </g>
        )}
        
        {/* Back legs (visible when not sleeping) */}
        {!isSleeping && (
          <>
            <ellipse cx="22" cy="48" rx="4" ry="3" fill={bodyColor} />
            <ellipse cx="42" cy="48" rx="4" ry="3" fill={bodyColor} />
          </>
        )}
        
        {/* Front paws */}
        <ellipse 
          cx={isSleeping ? '38' : '26'} 
          cy={isSleeping ? '50' : '50'} 
          rx="4" 
          ry="3" 
          fill={bodyColor}
          className={cn(
            stateStr === 'grooming' && 'animate-cat-paw-lick',
            stateStr === 'walking' && 'animate-cat-walk-paw-l'
          )}
        />
        <ellipse 
          cx={isSleeping ? '44' : '38'} 
          cy={isSleeping ? '50' : '50'} 
          rx="4" 
          ry="3" 
          fill={bodyColor}
          className={stateStr === 'walking' ? 'animate-cat-walk-paw-r' : ''}
        />
        
        {/* Head group */}
        <g className={headClass}>
          {/* Head */}
          <circle
            cx="32"
            cy={isSleeping ? '42' : '28'}
            r="12"
            fill={bodyColor}
          />
          
          {/* Head pattern overlays */}
          {catPattern !== 'none' && (
            <g className="cat-head-pattern" style={{ opacity: 0.6 }}>
              {catPattern === 'tabby' && (
                <path d={isSleeping ? "M28 38 L32 36 L36 38" : "M28 24 L32 22 L36 24"} stroke={bodyColorDark} strokeWidth="1.5" fill="none" />
              )}
              {catPattern === 'siamese' && (
                <>
                  <ellipse cx="27" cy={isSleeping ? '42' : '28'} rx="4" ry="5" fill={bodyColorDark} style={{ opacity: 0.4 }} />
                  <ellipse cx="37" cy={isSleeping ? '42' : '28'} rx="4" ry="5" fill={bodyColorDark} style={{ opacity: 0.4 }} />
                </>
              )}
              {catPattern === 'van' && (
                <circle cx="32" cy={isSleeping ? '38' : '24'} r="5" fill={bodyColor} />
              )}
              {catPattern === 'hearts' && (
                <path d={isSleeping ? "M30 38 C29 37 30 36 31 37 C32 36 33 37 32 38 L31 39 Z" : "M30 24 C29 23 30 22 31 23 C32 22 33 23 32 24 L31 25 Z"} fill="#f472b6" style={{ opacity: 0.7 }} />
              )}
            </g>
          )}
          
          {/* Left ear - smaller cute pointy */}
          <path
            d={isSleeping ? "M20 38 L23 31 L27 38 Z" : "M19 24 L23 14 L27 24 Z"}
            fill={bodyColor}
            className={cn(earClass, stateStr === 'tap_reaction' ? 'animate-cat-ear-perk' : '')}
          />
          <path
            d={isSleeping ? "M21 37 L23 32 L25 37 Z" : "M20 23 L23 16 L26 23 Z"}
            fill={innerEarColor}
          />
          
          {/* Right ear - smaller cute pointy */}
          <path
            d={isSleeping ? "M37 38 L41 31 L45 38 Z" : "M37 24 L41 14 L45 24 Z"}
            fill={bodyColor}
            className={cn(earClass, stateStr === 'tap_reaction' ? 'animate-cat-ear-perk-alt' : '')}
          />
          <path
            d={isSleeping ? "M39 37 L41 32 L43 37 Z" : "M38 23 L41 16 L44 23 Z"}
            fill={innerEarColor}
          />
          
          {/* Eyes */}
          {eyesOpen ? (
            <g className={isBlinking ? 'animate-cat-blink' : ''}>
              {eyesHappy ? (
                // Happy curved eyes - black
                <>
                  <path d="M25 25 Q27 23 29 25" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M35 25 Q37 23 39 25" stroke="#0a0a0a" strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
              ) : eyesWide ? (
                // Wide curious eyes - black
                <>
                  <ellipse cx="27" cy={isSleeping ? '40' : '26'} rx="3.5" ry="4" fill="#0a0a0a" />
                  <ellipse cx="37" cy={isSleeping ? '40' : '26'} rx="3.5" ry="4" fill="#0a0a0a" />
                  <circle cx="26" cy={isSleeping ? '39' : '25'} r="1.5" fill="white" opacity="0.9" />
                  <circle cx="36" cy={isSleeping ? '39' : '25'} r="1.5" fill="white" opacity="0.9" />
                </>
              ) : (
                // Normal eyes - black
                <>
                  <ellipse cx="27" cy={isSleeping ? '40' : '26'} rx="2.5" ry="3" fill="#0a0a0a" />
                  <ellipse cx="37" cy={isSleeping ? '40' : '26'} rx="2.5" ry="3" fill="#0a0a0a" />
                  <circle cx="26" cy={isSleeping ? '39' : '25'} r="1" fill="white" opacity="0.8" />
                  <circle cx="36" cy={isSleeping ? '39' : '25'} r="1" fill="white" opacity="0.8" />
                </>
              )}
            </g>
          ) : (
            // Closed eyes (sleeping or blinking) - black
            <g>
              <path 
                d={isSleeping ? "M24 40 Q27 42 30 40" : "M24 26 Q27 28 30 26"} 
                stroke="#0a0a0a" 
                strokeWidth="1.5" 
                fill="none" 
              />
              <path 
                d={isSleeping ? "M34 40 Q37 42 40 40" : "M34 26 Q37 28 40 26"} 
                stroke="#0a0a0a" 
                strokeWidth="1.5" 
                fill="none" 
              />
            </g>
          )}
          
          {/* Nose */}
          <ellipse 
            cx="32" 
            cy={isSleeping ? '45' : '31'} 
            rx="1.5" 
            ry="1" 
            fill={noseColor} 
          />
          
          {/* Mouth - open when meowing */}
          {isMeowing ? (
            <ellipse
              cx="32"
              cy={isSleeping ? '48' : '34'}
              rx="2.5"
              ry="2"
              fill="#1f2937"
              className="animate-cat-mouth-meow"
            />
          ) : (
            <path
              d={isSleeping ? "M30 47 Q32 49 34 47" : "M30 33 Q32 35 34 33"}
              stroke={isDark ? '#4b5563' : '#92400e'}
              strokeWidth="1"
              fill="none"
            />
          )}
          
          {/* Whiskers */}
          <g stroke={whiskerColor} strokeWidth="0.5" className={stateStr === 'tap_reaction' ? 'animate-cat-whisker-twitch' : ''}>
            <line x1="18" y1={isSleeping ? '44' : '30'} x2="26" y2={isSleeping ? '45' : '31'} />
            <line x1="18" y1={isSleeping ? '46' : '32'} x2="26" y2={isSleeping ? '46' : '32'} />
            <line x1="18" y1={isSleeping ? '48' : '34'} x2="26" y2={isSleeping ? '47' : '33'} />
            <line x1="46" y1={isSleeping ? '44' : '30'} x2="38" y2={isSleeping ? '45' : '31'} />
            <line x1="46" y1={isSleeping ? '46' : '32'} x2="38" y2={isSleeping ? '46' : '32'} />
            <line x1="46" y1={isSleeping ? '48' : '34'} x2="38" y2={isSleeping ? '47' : '33'} />
          </g>
        </g>
        
        {/* Sleep Zs */}
        {isSleeping && (
          <g className="animate-cat-zzz">
            <text x="48" y="32" className="text-[8px] fill-primary font-bold">z</text>
            <text x="52" y="26" className="text-[6px] fill-primary font-bold opacity-70">z</text>
            <text x="56" y="22" className="text-[5px] fill-primary font-bold opacity-50">z</text>
          </g>
        )}
        
        {/* Grooming paw near face */}
        {stateStr === 'grooming' && (
          <ellipse
            cx="28"
            cy="28"
            rx="3"
            ry="4"
            fill={bodyColor}
            className="animate-cat-groom-paw"
          />
        )}
      </g>
      
      {/* Costume layer - rendered on top, positioned to follow cat */}
      <g 
        className="cat-costume-layer"
        style={{
          transform: isSleeping ? 'translate(0, 14px)' : 'none',
          transformOrigin: 'center',
        }}
      >
        <CatCostume costume={costume as any} isDark={isDark} />
      </g>
    </svg>
  );
});

CatBody.displayName = 'CatBody';

// Styles component to keep animations separate and clean
const CatStyles = memo(() => (
  <style>{`
    /* Body animations */
    @keyframes cat-stretch {
      0%, 100% { transform: scaleX(1) scaleY(1); }
      50% { transform: scaleX(1.12) scaleY(0.92); }
    }
    .animate-cat-stretch { animation: cat-stretch 2.5s ease-in-out; }
    
    @keyframes cat-playful {
      0%, 100% { transform: rotate(0deg) translateY(0); }
      25% { transform: rotate(-5deg) translateY(-3px); }
      50% { transform: rotate(5deg) translateY(0); }
      75% { transform: rotate(-3deg) translateY(-2px); }
    }
    .animate-cat-playful { animation: cat-playful 1.5s ease-in-out; }
    
    @keyframes cat-hop {
      0%, 100% { transform: translateY(0); }
      30% { transform: translateY(-8px); }
      50% { transform: translateY(-4px); }
      70% { transform: translateY(-6px); }
    }
    .animate-cat-hop { animation: cat-hop 0.8s ease-out; }
    
    @keyframes cat-curl {
      0%, 100% { transform: scale(1); }
    }
    .animate-cat-curl { transform: scale(0.95); }
    
    @keyframes cat-breathe {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(1.03); }
    }
    .animate-cat-breathe { animation: cat-breathe 2.5s ease-in-out infinite; }
    
    /* Head animations */
    @keyframes cat-head-tilt {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(12deg); }
    }
    .animate-cat-head-tilt { animation: cat-head-tilt 0.6s ease-out; }
    
    @keyframes cat-head-down {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(2px); }
    }
    .animate-cat-head-down { animation: cat-head-down 1.5s ease-in-out infinite; }
    
    /* Ear animations */
    @keyframes cat-ear-perk {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-8deg); }
    }
    .animate-cat-ear-perk { animation: cat-ear-perk 0.4s ease-out; }
    .animate-cat-ear-perk-alt { animation: cat-ear-perk 0.4s ease-out 0.1s; }
    
    @keyframes cat-ear-twitch {
      0%, 100% { transform: rotate(0deg) translateY(0); }
      25% { transform: rotate(-5deg) translateY(-1px); }
      50% { transform: rotate(3deg) translateY(0); }
      75% { transform: rotate(-3deg) translateY(-1px); }
    }
    .animate-cat-ear-twitch { animation: cat-ear-twitch 0.4s ease-in-out 2; }
    
    @keyframes cat-ears-back {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(15deg) translateX(2px); }
    }
    .animate-cat-ears-back { animation: cat-ears-back 0.3s ease-out forwards; }
    
    @keyframes cat-ears-forward {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-10deg); }
    }
    .animate-cat-ears-forward { animation: cat-ears-forward 0.5s ease-out; }
    
    /* Eye animations */
    @keyframes cat-blink {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(0.1); }
    }
    .animate-cat-blink { animation: cat-blink 0.15s ease-in-out; }
    
    /* Tail animations */
    @keyframes cat-tail-idle {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(8deg); }
    }
    .animate-cat-tail-idle { animation: cat-tail-idle 3s ease-in-out infinite; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-wag {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(15deg); }
      75% { transform: rotate(-15deg); }
    }
    .animate-cat-tail-wag { animation: cat-tail-wag 0.3s ease-in-out infinite; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-wrap {
      0%, 100% { transform: rotate(0deg); }
    }
    .animate-cat-tail-wrap { transform-origin: 24px 48px; }
    
    @keyframes cat-tail-swish {
      0%, 100% { transform: rotate(0deg); }
      20% { transform: rotate(25deg); }
      40% { transform: rotate(-20deg); }
      60% { transform: rotate(15deg); }
      80% { transform: rotate(-10deg); }
    }
    .animate-cat-tail-swish { animation: cat-tail-swish 1.5s ease-in-out; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-excited {
      0%, 100% { transform: rotate(0deg); }
      10% { transform: rotate(20deg); }
      20% { transform: rotate(-20deg); }
      30% { transform: rotate(18deg); }
      40% { transform: rotate(-18deg); }
      50% { transform: rotate(15deg); }
      60% { transform: rotate(-15deg); }
      70% { transform: rotate(10deg); }
      80% { transform: rotate(-10deg); }
      90% { transform: rotate(5deg); }
    }
    .animate-cat-tail-excited { animation: cat-tail-excited 1.5s ease-in-out; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-twitch {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(5deg); }
      50% { transform: rotate(-3deg); }
      75% { transform: rotate(4deg); }
    }
    .animate-cat-tail-twitch { animation: cat-tail-twitch 0.3s ease-in-out infinite; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-puff {
      0% { transform: scale(1); }
      50% { transform: scale(1.3) rotate(10deg); }
      100% { transform: scale(1.2) rotate(5deg); }
    }
    .animate-cat-tail-puff { animation: cat-tail-puff 0.3s ease-out forwards; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-heart {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(10deg) translateY(-2px); }
      50% { transform: rotate(-5deg) translateY(-4px); }
      75% { transform: rotate(8deg) translateY(-2px); }
    }
    .animate-cat-tail-heart { animation: cat-tail-heart 1s ease-in-out; transform-origin: 46px 42px; }
    
    /* Paw animations */
    @keyframes cat-paw-lick {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(-20deg); }
    }
    .animate-cat-paw-lick { animation: cat-paw-lick 1s ease-in-out infinite; transform-origin: center; }
    
    @keyframes cat-groom-paw {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }
    .animate-cat-groom-paw { animation: cat-groom-paw 0.5s ease-in-out infinite; }
    
    @keyframes cat-walk-paw-l {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    .animate-cat-walk-paw-l { animation: cat-walk-paw-l 0.25s ease-in-out infinite; }
    
    @keyframes cat-walk-paw-r {
      0%, 100% { transform: translateY(-3px); }
      50% { transform: translateY(0); }
    }
    .animate-cat-walk-paw-r { animation: cat-walk-paw-r 0.25s ease-in-out infinite; }
    
    @keyframes cat-lick-paw {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      30% { transform: translateY(-10px) rotate(-25deg); }
      60% { transform: translateY(-8px) rotate(-20deg); }
    }
    .animate-cat-lick-paw { animation: cat-lick-paw 2s ease-in-out infinite; }
    
    @keyframes cat-scratch {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      20% { transform: translateY(-12px) rotate(-30deg); }
      40% { transform: translateY(-10px) rotate(-25deg); }
      60% { transform: translateY(-12px) rotate(-30deg); }
      80% { transform: translateY(-10px) rotate(-25deg); }
    }
    .animate-cat-scratch { animation: cat-scratch 1.8s ease-in-out infinite; }
    
    @keyframes cat-knead-paw {
      0%, 100% { transform: translateY(0); }
      25% { transform: translateY(-2px); }
      50% { transform: translateY(0); }
      75% { transform: translateY(-2px); }
    }
    .animate-cat-knead-paw { animation: cat-knead-paw 0.6s ease-in-out infinite; }
    
    @keyframes cat-wave-paw {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-8px) rotate(-15deg); }
      50% { transform: translateY(-6px) rotate(10deg); }
      75% { transform: translateY(-8px) rotate(-10deg); }
    }
    .animate-cat-wave-paw { animation: cat-wave-paw 0.8s ease-in-out 2; }
    
    /* Whisker animation */
    @keyframes cat-whisker-twitch {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(3deg); }
    }
    .animate-cat-whisker-twitch { animation: cat-whisker-twitch 0.2s ease-in-out 3; }
    
    @keyframes cat-whisker-sniff {
      0%, 100% { transform: rotate(0deg) translateX(0); }
      25% { transform: rotate(2deg) translateX(1px); }
      50% { transform: rotate(-2deg) translateX(-1px); }
      75% { transform: rotate(1deg) translateX(0.5px); }
    }
    .animate-cat-whisker-sniff { animation: cat-whisker-sniff 0.3s ease-in-out 4; }
    
    /* Sleep Zs */
    @keyframes cat-zzz {
      0%, 100% { opacity: 0; transform: translateY(0); }
      50% { opacity: 1; transform: translateY(-8px); }
    }
    .animate-cat-zzz { animation: cat-zzz 2.5s ease-in-out infinite; }
    
    /* Tap animations */
    @keyframes cat-bounce {
      0%, 100% { transform: translateY(0) scaleY(1); }
      20% { transform: translateY(-12px) scaleY(1.05); }
      40% { transform: translateY(0) scaleY(0.9); }
      60% { transform: translateY(-6px) scaleY(1.02); }
      80% { transform: translateY(0) scaleY(0.95); }
    }
    .animate-cat-bounce { animation: cat-bounce 0.7s ease-out; }
    
    @keyframes cat-spin {
      0% { transform: rotate(0deg) scale(1); }
      15% { transform: rotate(60deg) scale(0.95) translateY(-5px); }
      30% { transform: rotate(130deg) scale(0.9) translateY(-8px); }
      50% { transform: rotate(200deg) scale(0.88) translateY(-10px); }
      70% { transform: rotate(280deg) scale(0.92) translateY(-6px); }
      85% { transform: rotate(340deg) scale(0.96) translateY(-3px); }
      100% { transform: rotate(360deg) scale(1) translateY(0); }
    }
    .animate-cat-spin { animation: cat-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1); transform-origin: center center; }
    
    @keyframes cat-meow-body {
      0%, 100% { transform: translateY(0); }
      25% { transform: translateY(-2px); }
      50% { transform: translateY(0); }
      75% { transform: translateY(-1px); }
    }
    .animate-cat-meow-body { animation: cat-meow-body 1s ease-in-out; }
    
    @keyframes cat-head-meow {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      30% { transform: translateY(-3px) rotate(-5deg); }
      60% { transform: translateY(-2px) rotate(3deg); }
    }
    .animate-cat-head-meow { animation: cat-head-meow 1s ease-in-out; }
    
    @keyframes cat-mouth-meow {
      0%, 100% { transform: scaleY(1); }
      25% { transform: scaleY(1.3); }
      50% { transform: scaleY(0.8); }
      75% { transform: scaleY(1.2); }
    }
    .animate-cat-mouth-meow { animation: cat-mouth-meow 0.8s ease-in-out; transform-origin: center; }
    
    @keyframes cat-curious {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .animate-cat-curious { animation: cat-curious 1.2s ease-in-out; }
    
    @keyframes cat-head-curious {
      0%, 100% { transform: rotate(0deg); }
      30% { transform: rotate(-15deg); }
      70% { transform: rotate(10deg); }
    }
    .animate-cat-head-curious { animation: cat-head-curious 1.2s ease-in-out; }
    
    @keyframes cat-tail-perk {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(20deg); }
    }
    .animate-cat-tail-perk { animation: cat-tail-perk 0.4s ease-out; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(180deg); }
    }
    .animate-cat-tail-spin { animation: cat-tail-spin 0.6s ease-in-out; transform-origin: 46px 42px; }
    
    /* New tap reaction animations */
    @keyframes cat-love {
      0%, 100% { transform: scale(1) translateY(0); }
      25% { transform: scale(1.05) translateY(-3px); }
      50% { transform: scale(1.08) translateY(-5px); }
      75% { transform: scale(1.05) translateY(-3px); }
    }
    .animate-cat-love { animation: cat-love 1s ease-in-out; }
    
    @keyframes cat-head-love {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-8deg); }
      50% { transform: rotate(8deg); }
      75% { transform: rotate(-5deg); }
    }
    .animate-cat-head-love { animation: cat-head-love 1s ease-in-out; }
    
    @keyframes cat-roll {
      0% { transform: rotate(0deg); }
      50% { transform: rotate(180deg) translateY(-10px); }
      100% { transform: rotate(360deg) translateY(0); }
    }
    .animate-cat-roll { animation: cat-roll 1.2s ease-in-out; }
    
    @keyframes cat-shake {
      0%, 100% { transform: translateX(0); }
      10% { transform: translateX(-3px); }
      20% { transform: translateX(3px); }
      30% { transform: translateX(-3px); }
      40% { transform: translateX(3px); }
      50% { transform: translateX(-2px); }
      60% { transform: translateX(2px); }
      70% { transform: translateX(-1px); }
      80% { transform: translateX(1px); }
    }
    .animate-cat-shake { animation: cat-shake 0.6s ease-in-out; }
    
    @keyframes cat-wave {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    .animate-cat-wave { animation: cat-wave 0.8s ease-in-out; }
    
    @keyframes cat-jump {
      0%, 100% { transform: translateY(0) scaleY(1); }
      30% { transform: translateY(-20px) scaleY(1.1); }
      50% { transform: translateY(-25px) scaleY(1.05); }
      70% { transform: translateY(-15px) scaleY(1.08); }
    }
    .animate-cat-jump { animation: cat-jump 0.7s ease-out; }
    
    /* Idle variation animations */
    @keyframes cat-look-left {
      0%, 100% { transform: rotate(0deg) translateX(0); }
      50% { transform: rotate(-10deg) translateX(-2px); }
    }
    .animate-cat-look-left { animation: cat-look-left 1.5s ease-in-out; }
    
    @keyframes cat-look-right {
      0%, 100% { transform: rotate(0deg) translateX(0); }
      50% { transform: rotate(10deg) translateX(2px); }
    }
    .animate-cat-look-right { animation: cat-look-right 1.5s ease-in-out; }
    
    @keyframes cat-look-up {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-3px) rotate(-5deg); }
    }
    .animate-cat-look-up { animation: cat-look-up 1.2s ease-in-out; }
    
    @keyframes cat-sniff {
      0%, 100% { transform: translateY(0); }
      20% { transform: translateY(-1px); }
      40% { transform: translateY(0); }
      60% { transform: translateY(-1px); }
      80% { transform: translateY(0); }
    }
    .animate-cat-sniff { animation: cat-sniff 0.8s ease-in-out; }
    
    @keyframes cat-yawn {
      0%, 100% { transform: scaleY(1); }
      30% { transform: scaleY(1.02); }
      50% { transform: scaleY(1.05); }
      70% { transform: scaleY(1.02); }
    }
    .animate-cat-yawn { animation: cat-yawn 1.8s ease-in-out; }
    
    @keyframes cat-head-yawn {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      30% { transform: translateY(-2px) rotate(-3deg); }
      50% { transform: translateY(-3px) rotate(-5deg); }
      70% { transform: translateY(-2px) rotate(-3deg); }
    }
    .animate-cat-head-yawn { animation: cat-head-yawn 1.8s ease-in-out; }
    
    @keyframes cat-head-shake {
      0%, 100% { transform: rotate(0deg); }
      20% { transform: rotate(-8deg); }
      40% { transform: rotate(8deg); }
      60% { transform: rotate(-5deg); }
      80% { transform: rotate(5deg); }
    }
    .animate-cat-head-shake { animation: cat-head-shake 0.6s ease-in-out; }
    
    /* Active behavior animations */
    @keyframes cat-pounce-ready {
      0%, 100% { transform: scaleY(0.9) scaleX(1.05); }
      50% { transform: scaleY(0.85) scaleX(1.08); }
    }
    .animate-cat-pounce-ready { animation: cat-pounce-ready 0.8s ease-in-out infinite; }
    
    @keyframes cat-pounce {
      0% { transform: translateY(0) translateX(0) scaleY(1); }
      30% { transform: translateY(-15px) translateX(20px) scaleY(1.1); }
      60% { transform: translateY(-5px) translateX(35px) scaleY(0.95); }
      100% { transform: translateY(0) translateX(40px) scaleY(1); }
    }
    .animate-cat-pounce { animation: cat-pounce 0.6s ease-out; }
    
    @keyframes cat-loaf {
      0%, 100% { transform: scaleX(1.1) scaleY(0.85); }
    }
    .animate-cat-loaf { transform: scaleX(1.1) scaleY(0.85); }
    
    @keyframes cat-knead {
      0%, 100% { transform: translateY(0); }
      25% { transform: translateY(-1px); }
      50% { transform: translateY(0); }
      75% { transform: translateY(-1px); }
    }
    .animate-cat-knead { animation: cat-knead 1s ease-in-out infinite; }
    
    @keyframes cat-belly-up {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(180deg) scaleY(-1); }
    }
    .animate-cat-belly-up { transform: rotate(20deg) scaleY(0.9); }
    
    @keyframes cat-sit-tall {
      0%, 100% { transform: scaleY(1.1) translateY(-3px); }
    }
    .animate-cat-sit-tall { transform: scaleY(1.08) translateY(-2px); }
    
    @keyframes cat-crouch {
      0%, 100% { transform: scaleY(0.8) scaleX(1.1); }
    }
    .animate-cat-crouch { transform: scaleY(0.8) scaleX(1.08); }
    
    @keyframes cat-startled {
      0% { transform: translateY(0) scaleY(1); }
      30% { transform: translateY(-10px) scaleY(1.15); }
      100% { transform: translateY(-5px) scaleY(1.1); }
    }
    .animate-cat-startled { animation: cat-startled 0.4s ease-out forwards; }
    
    @keyframes cat-head-startled {
      0% { transform: rotate(0deg); }
      50% { transform: rotate(-10deg) translateY(-3px); }
      100% { transform: rotate(-5deg) translateY(-2px); }
    }
    .animate-cat-head-startled { animation: cat-head-startled 0.4s ease-out forwards; }
    
    @keyframes cat-happy-dance {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      20% { transform: translateY(-5px) rotate(-5deg); }
      40% { transform: translateY(0) rotate(5deg); }
      60% { transform: translateY(-5px) rotate(-3deg); }
      80% { transform: translateY(0) rotate(3deg); }
    }
    .animate-cat-happy-dance { animation: cat-happy-dance 1.5s ease-in-out; }
    
    @keyframes cat-tail-chase {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(90deg); }
      50% { transform: rotate(180deg); }
      75% { transform: rotate(270deg); }
      100% { transform: rotate(360deg); }
    }
    .animate-cat-tail-chase { animation: cat-tail-chase 2s linear; }
    
    /* New lifelike animations */
    @keyframes cat-curious-walk {
      0%, 100% { transform: translateY(0); }
      25% { transform: translateY(-2px) rotate(-2deg); }
      75% { transform: translateY(-2px) rotate(2deg); }
    }
    .animate-cat-curious-walk { animation: cat-curious-walk 0.6s ease-in-out infinite; }
    
    @keyframes cat-settle {
      0% { transform: scaleY(1); }
      50% { transform: scaleY(0.95) scaleX(1.02); }
      100% { transform: scaleY(0.9) scaleX(1.05); }
    }
    .animate-cat-settle { animation: cat-settle 2s ease-out forwards; }
    
    @keyframes cat-curl-up {
      0%, 100% { transform: scaleY(0.85) scaleX(1.1) rotate(-5deg); }
      50% { transform: scaleY(0.83) scaleX(1.12) rotate(-5deg); }
    }
    .animate-cat-curl-up { animation: cat-curl-up 3s ease-in-out infinite; }
    
    @keyframes cat-bat {
      0%, 100% { transform: translateY(0); }
      15% { transform: translateY(-8px) rotate(-10deg); }
      30% { transform: translateY(-3px) rotate(5deg); }
      45% { transform: translateY(-10px) rotate(-8deg); }
      60% { transform: translateY(-2px) rotate(3deg); }
    }
    .animate-cat-bat { animation: cat-bat 1.5s ease-in-out; }
    
    @keyframes cat-watch {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-1px); }
    }
    .animate-cat-watch { animation: cat-watch 2s ease-in-out infinite; }
    
    @keyframes cat-head-watch {
      0%, 40% { transform: rotate(0deg); }
      50% { transform: rotate(5deg); }
      60%, 100% { transform: rotate(-5deg); }
    }
    .animate-cat-head-watch { animation: cat-head-watch 3s ease-in-out infinite; }
    
    @keyframes cat-flop {
      0% { transform: rotate(0deg); }
      50% { transform: rotate(15deg) translateX(3px); }
      100% { transform: rotate(25deg) translateX(5px) scaleY(0.9); }
    }
    .animate-cat-flop { animation: cat-flop 1.5s ease-out forwards; }
    
    @keyframes cat-dream-twitch {
      0%, 70%, 100% { transform: scaleY(0.85) scaleX(1.1); }
      75% { transform: scaleY(0.88) scaleX(1.08) rotate(2deg); }
      85% { transform: scaleY(0.83) scaleX(1.12) rotate(-1deg); }
    }
    .animate-cat-dream-twitch { animation: cat-dream-twitch 1.5s ease-in-out; }
    
    @keyframes cat-wake-stretch {
      0% { transform: scaleY(0.85) scaleX(1.1); }
      30% { transform: scaleY(1.15) scaleX(0.9); }
      60% { transform: scaleY(1.2) scaleX(0.85) translateY(-5px); }
      100% { transform: scaleY(1) scaleX(1); }
    }
    .animate-cat-wake-stretch { animation: cat-wake-stretch 2s ease-in-out; }
    
    @keyframes cat-snuggle {
      0%, 100% { transform: scaleY(0.88) scaleX(1.08) rotate(-3deg); }
      50% { transform: scaleY(0.9) scaleX(1.06) rotate(-5deg); }
    }
    .animate-cat-snuggle { animation: cat-snuggle 3s ease-in-out infinite; }
    
    @keyframes cat-lazy-roll {
      0% { transform: rotate(0deg); }
      30% { transform: rotate(10deg) translateY(-2px); }
      70% { transform: rotate(-10deg) translateY(-2px); }
      100% { transform: rotate(0deg); }
    }
    .animate-cat-lazy-roll { animation: cat-lazy-roll 2s ease-in-out; }
    
    @keyframes cat-paw-tuck {
      0%, 100% { transform: scaleX(1.05) scaleY(0.95); }
    }
    .animate-cat-paw-tuck { transform: scaleX(1.05) scaleY(0.95); }
    
    @keyframes cat-head-tilt-curious {
      0%, 100% { transform: rotate(-15deg); }
      50% { transform: rotate(-20deg) translateY(-1px); }
    }
    .animate-cat-head-tilt-curious { animation: cat-head-tilt-curious 1.5s ease-in-out infinite; }
    
    @keyframes cat-head-alert {
      0%, 100% { transform: translateY(-2px); }
      50% { transform: translateY(-4px); }
    }
    .animate-cat-head-alert { animation: cat-head-alert 1s ease-in-out infinite; }
    
    @keyframes cat-ears-alert {
      0%, 100% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
    }
    .animate-cat-ears-alert { animation: cat-ears-alert 0.8s ease-in-out infinite; }
    
    @keyframes cat-tail-flick {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(15deg); }
      75% { transform: rotate(-15deg); }
    }
    .animate-cat-tail-flick { animation: cat-tail-flick 0.8s ease-in-out; }
    
    @keyframes cat-tail-slow-swish {
      0%, 100% { transform: rotate(-10deg); }
      50% { transform: rotate(10deg); }
    }
    .animate-cat-tail-slow-swish { animation: cat-tail-slow-swish 2s ease-in-out infinite; }
    
    /* Costume entrance */
    @keyframes costume-in {
      0% { opacity: 0; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1); }
    }
    .animate-costume-in { animation: costume-in 0.3s ease-out; }
  `}</style>
));

CatStyles.displayName = 'CatStyles';

export default CatCompanion;
