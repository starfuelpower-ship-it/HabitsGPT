import { useState, useEffect, useCallback, useRef } from 'react';

export type CatState = 
  | 'idle' 
  | 'blinking' 
  | 'grooming' 
  | 'stretching' 
  | 'walking' 
  | 'sleeping' 
  | 'playful' 
  // Tap reactions
  | 'tap_reaction'
  | 'tap_meow'
  | 'tap_spin'
  | 'tap_bounce'
  | 'tap_curious'
  | 'tap_love'
  | 'tap_roll'
  | 'tap_shake'
  | 'tap_wave'
  | 'tap_jump'
  // Idle variations
  | 'idle_look_left'
  | 'idle_look_right'
  | 'idle_look_up'
  | 'idle_ear_twitch'
  | 'idle_tail_swish'
  | 'idle_yawn'
  | 'idle_sniff'
  | 'idle_whisker_twitch'
  // Active behaviors
  | 'pounce_ready'
  | 'pounce'
  | 'loaf'
  | 'knead'
  | 'belly_up'
  | 'sit_tall'
  | 'crouch'
  | 'startled'
  | 'happy_dance'
  | 'tail_chase'
  | 'head_shake'
  | 'lick_paw'
  | 'scratch_ear'
  // New lifelike behaviors
  | 'curious_walk'
  | 'settle_down'
  | 'curl_up'
  | 'bat_at_air'
  | 'watch_something'
  | 'flop_over'
  | 'twitch_dream'
  | 'wake_stretch'
  | 'alert_ears'
  | 'tail_flick'
  | 'snuggle'
  | 'lazy_roll'
  | 'head_tilt'
  | 'paw_tuck';

// All tap reaction states - tap_meow is primary so cat opens mouth and mews
const TAP_REACTIONS: CatState[] = [
  'tap_meow', 'tap_meow', 'tap_meow', 'tap_meow', // Heavily weighted to meow
  'tap_reaction', 'tap_bounce', 'tap_curious', 'tap_love'
];

interface CatBehaviorConfig {
  isDarkMode: boolean;
  isEnabled: boolean;
  hasReaction: 'habit_complete' | 'all_complete' | null;
  isDragging: boolean;
  hasCustomPosition: boolean;
}

interface CatBehaviorState {
  currentState: CatState;
  walkDirection: number; // -1 left, 0 none, 1 right
  walkProgress: number; // 0-100
}

const STATE_DURATIONS: Record<CatState, { min: number; max: number }> = {
  idle: { min: 4000, max: 8000 },
  blinking: { min: 300, max: 500 },
  grooming: { min: 2500, max: 4000 },
  stretching: { min: 2000, max: 3000 },
  walking: { min: 3000, max: 5000 },
  sleeping: { min: 8000, max: 15000 },
  playful: { min: 1500, max: 2500 },
  // Tap reactions
  tap_reaction: { min: 800, max: 1200 },
  tap_meow: { min: 1000, max: 1400 },
  tap_spin: { min: 600, max: 900 },
  tap_bounce: { min: 700, max: 1000 },
  tap_curious: { min: 1200, max: 1600 },
  tap_love: { min: 1000, max: 1400 },
  tap_roll: { min: 1200, max: 1600 },
  tap_shake: { min: 600, max: 900 },
  tap_wave: { min: 800, max: 1200 },
  tap_jump: { min: 700, max: 1000 },
  // Idle variations
  idle_look_left: { min: 1500, max: 2500 },
  idle_look_right: { min: 1500, max: 2500 },
  idle_look_up: { min: 1200, max: 2000 },
  idle_ear_twitch: { min: 400, max: 700 },
  idle_tail_swish: { min: 1500, max: 2500 },
  idle_yawn: { min: 1800, max: 2500 },
  idle_sniff: { min: 800, max: 1200 },
  idle_whisker_twitch: { min: 500, max: 800 },
  // Active behaviors
  pounce_ready: { min: 1200, max: 1800 },
  pounce: { min: 600, max: 900 },
  loaf: { min: 5000, max: 10000 },
  knead: { min: 2500, max: 4000 },
  belly_up: { min: 2000, max: 3500 },
  sit_tall: { min: 3000, max: 5000 },
  crouch: { min: 1500, max: 2500 },
  startled: { min: 500, max: 800 },
  happy_dance: { min: 1500, max: 2200 },
  tail_chase: { min: 2000, max: 3000 },
  head_shake: { min: 600, max: 900 },
  lick_paw: { min: 2000, max: 3000 },
  scratch_ear: { min: 1800, max: 2800 },
  // New lifelike behaviors
  curious_walk: { min: 4000, max: 7000 },
  settle_down: { min: 2000, max: 3000 },
  curl_up: { min: 6000, max: 12000 },
  bat_at_air: { min: 1500, max: 2500 },
  watch_something: { min: 3000, max: 5000 },
  flop_over: { min: 1500, max: 2500 },
  twitch_dream: { min: 1000, max: 2000 },
  wake_stretch: { min: 2000, max: 3000 },
  alert_ears: { min: 1000, max: 1800 },
  tail_flick: { min: 800, max: 1200 },
  snuggle: { min: 4000, max: 8000 },
  lazy_roll: { min: 2000, max: 3000 },
  head_tilt: { min: 1200, max: 2000 },
  paw_tuck: { min: 1500, max: 2500 },
};

// Behavior sequences - cat will chain these naturally
const BEHAVIOR_CHAINS: Record<string, CatState[]> = {
  explore: ['idle_look_left', 'idle_look_right', 'curious_walk', 'idle_sniff', 'watch_something'],
  settle: ['stretching', 'settle_down', 'curl_up', 'sleeping'],
  playful: ['alert_ears', 'pounce_ready', 'pounce', 'tail_chase', 'bat_at_air'],
  sleepy: ['idle_yawn', 'loaf', 'settle_down', 'curl_up', 'twitch_dream'],
  groom: ['sit_tall', 'lick_paw', 'scratch_ear', 'grooming', 'head_shake'],
  wake: ['twitch_dream', 'wake_stretch', 'idle_yawn', 'idle'],
};

// States that can transition to from idle during day
const DAY_TRANSITIONS: CatState[] = [
  'blinking', 'grooming', 'stretching', 'playful', 'walking',
  'idle_look_left', 'idle_look_right', 'idle_look_up', 'idle_ear_twitch',
  'idle_tail_swish', 'idle_yawn', 'idle_sniff', 'idle_whisker_twitch',
  'pounce_ready', 'loaf', 'knead', 'sit_tall', 'crouch',
  'happy_dance', 'tail_chase', 'lick_paw', 'scratch_ear',
  'curious_walk', 'bat_at_air', 'watch_something', 'head_tilt',
  'alert_ears', 'tail_flick', 'lazy_roll'
];

// States that can transition to from idle during night (dark mode)
const NIGHT_TRANSITIONS: CatState[] = [
  'blinking', 'sleeping', 'idle', 'loaf', 'idle_yawn',
  'idle_ear_twitch', 'idle_tail_swish', 'curl_up', 'settle_down',
  'snuggle', 'twitch_dream', 'paw_tuck'
];

// Weights for state selection (higher = more likely)
const STATE_WEIGHTS: Record<CatState, number> = {
  idle: 2,
  blinking: 4,
  grooming: 2,
  stretching: 2,
  walking: 2,
  sleeping: 3,
  playful: 2,
  // Tap reactions (0 = only triggered by tap)
  tap_reaction: 0,
  tap_meow: 0,
  tap_spin: 0,
  tap_bounce: 0,
  tap_curious: 0,
  tap_love: 0,
  tap_roll: 0,
  tap_shake: 0,
  tap_wave: 0,
  tap_jump: 0,
  // Idle variations
  idle_look_left: 4,
  idle_look_right: 4,
  idle_look_up: 3,
  idle_ear_twitch: 5,
  idle_tail_swish: 4,
  idle_yawn: 3,
  idle_sniff: 3,
  idle_whisker_twitch: 4,
  // Active behaviors
  pounce_ready: 2,
  pounce: 0,
  loaf: 3,
  knead: 2,
  belly_up: 1,
  sit_tall: 3,
  crouch: 2,
  startled: 0,
  happy_dance: 1,
  tail_chase: 2,
  head_shake: 2,
  lick_paw: 3,
  scratch_ear: 3,
  // New behaviors
  curious_walk: 3,
  settle_down: 2,
  curl_up: 3,
  bat_at_air: 2,
  watch_something: 3,
  flop_over: 2,
  twitch_dream: 1,
  wake_stretch: 1,
  alert_ears: 3,
  tail_flick: 4,
  snuggle: 2,
  lazy_roll: 2,
  head_tilt: 3,
  paw_tuck: 2,
};

function getRandomDuration(state: CatState): number {
  const { min, max } = STATE_DURATIONS[state];
  return min + Math.random() * (max - min);
}

function selectNextState(isDarkMode: boolean, hasCustomPosition: boolean, currentState: CatState): CatState {
  // Check if we should continue a behavior chain
  for (const [, chain] of Object.entries(BEHAVIOR_CHAINS)) {
    const currentIndex = chain.indexOf(currentState);
    if (currentIndex !== -1 && currentIndex < chain.length - 1) {
      // 60% chance to continue the chain
      if (Math.random() < 0.6) {
        return chain[currentIndex + 1];
      }
    }
  }

  // 20% chance to start a new behavior chain
  if (Math.random() < 0.2) {
    const chainKeys = Object.keys(BEHAVIOR_CHAINS);
    const chainKey = isDarkMode 
      ? (['sleepy', 'settle', 'wake'] as const)[Math.floor(Math.random() * 3)]
      : chainKeys[Math.floor(Math.random() * chainKeys.length)];
    const chain = BEHAVIOR_CHAINS[chainKey];
    if (chain) return chain[0];
  }

  const transitions = isDarkMode ? NIGHT_TRANSITIONS : DAY_TRANSITIONS;
  
  // Filter out walking states if cat has been moved
  const availableStates = hasCustomPosition 
    ? transitions.filter(s => s !== 'walking' && s !== 'curious_walk') 
    : transitions;
  
  // Weighted random selection
  const weights = availableStates.map(s => STATE_WEIGHTS[s] || 1);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < availableStates.length; i++) {
    random -= weights[i];
    if (random <= 0) return availableStates[i];
  }
  
  return 'idle';
}

export function useCatBehavior(config: CatBehaviorConfig) {
  const { isDarkMode, isEnabled, hasReaction, isDragging, hasCustomPosition } = config;
  
  const [state, setState] = useState<CatBehaviorState>({
    currentState: 'idle',
    walkDirection: 0,
    walkProgress: 0,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const walkIntervalRef = useRef<NodeJS.Timeout>();
  const lastBlinkRef = useRef<number>(Date.now());
  
  // Handle reaction animations from habit completion
  useEffect(() => {
    if (hasReaction === 'habit_complete') {
      // Random happy reaction
      const happyStates: CatState[] = ['playful', 'happy_dance', 'tap_love', 'tap_bounce'];
      const randomState = happyStates[Math.floor(Math.random() * happyStates.length)];
      setState(s => ({ ...s, currentState: randomState }));
      timeoutRef.current = setTimeout(() => {
        setState(s => ({ ...s, currentState: 'idle' }));
      }, 1500);
    } else if (hasReaction === 'all_complete') {
      setState(s => ({ ...s, currentState: 'happy_dance' }));
      timeoutRef.current = setTimeout(() => {
        setState(s => ({ ...s, currentState: 'idle' }));
      }, 2500);
    }
  }, [hasReaction]);
  
  // Main behavior loop
  useEffect(() => {
    if (!isEnabled || isDragging) return;
    
    const scheduleNextState = () => {
      const duration = getRandomDuration(state.currentState);
      
      timeoutRef.current = setTimeout(() => {
        // Don't interrupt reactions
        if (hasReaction) return scheduleNextState();
        
        let nextState = selectNextState(isDarkMode, hasCustomPosition, state.currentState);
        
        // Chain pounce_ready -> pounce
        if (state.currentState === 'pounce_ready') {
          nextState = 'pounce';
        }
        
        // Handle walking states
        if (nextState === 'walking' || nextState === 'curious_walk') {
          const direction = Math.random() > 0.5 ? 1 : -1;
          const isCurious = nextState === 'curious_walk';
          setState(s => ({ 
            ...s, 
            currentState: nextState,
            walkDirection: direction,
            walkProgress: 0 
          }));
          
          // Animate walk progress - curious walk is slower
          let progress = 0;
          const step = isCurious ? 1 : 2;
          walkIntervalRef.current = setInterval(() => {
            progress += step;
            setState(s => ({ ...s, walkProgress: progress }));
            if (progress >= 100) {
              clearInterval(walkIntervalRef.current);
              // After curious walk, might stop to look around
              const afterWalk = isCurious && Math.random() < 0.5 
                ? 'watch_something' 
                : 'idle';
              setState(s => ({ ...s, currentState: afterWalk, walkDirection: 0 }));
            }
          }, 50);
        } else if (nextState === 'tail_chase') {
          // Tail chase animation with rotation
          setState(s => ({ ...s, currentState: 'tail_chase' }));
        } else if (nextState === 'curl_up' || nextState === 'sleeping') {
          // Transition to sleep state
          setState(s => ({ ...s, currentState: nextState }));
        } else {
          setState(s => ({ ...s, currentState: nextState }));
        }
        
        scheduleNextState();
      }, duration);
    };
    
    scheduleNextState();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    };
  }, [isEnabled, isDragging, isDarkMode, hasCustomPosition, hasReaction, state.currentState]);
  
  // Periodic blinking (every 3-6 seconds when not in other animations)
  useEffect(() => {
    if (!isEnabled) return;
    
    const blinkInterval = setInterval(() => {
      const now = Date.now();
      const canBlink = ['idle', 'sit_tall', 'loaf', 'watch_something'].includes(state.currentState);
      if (
        now - lastBlinkRef.current > 3000 && 
        canBlink &&
        !hasReaction
      ) {
        setState(s => ({ ...s, currentState: 'blinking' }));
        lastBlinkRef.current = now;
        
        setTimeout(() => {
          setState(s => {
            if (s.currentState === 'blinking') {
              return { ...s, currentState: 'idle' };
            }
            return s;
          });
        }, 500);
      }
    }, 3000 + Math.random() * 3000);
    
    return () => clearInterval(blinkInterval);
  }, [isEnabled, state.currentState, hasReaction]);
  
  // Tap reaction handler - randomly selects from available tap animations
  const triggerTapReaction = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Pick a random tap reaction
    const randomTapState = TAP_REACTIONS[Math.floor(Math.random() * TAP_REACTIONS.length)];
    setState(s => ({ ...s, currentState: randomTapState }));
    
    timeoutRef.current = setTimeout(() => {
      setState(s => ({ ...s, currentState: 'idle' }));
    }, getRandomDuration(randomTapState));
  }, []);
  
  return {
    ...state,
    triggerTapReaction,
  };
}