import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface QuotesContextType {
  currentQuote: string;
  refreshQuote: () => void;
  goBack: () => void;
  canGoBack: boolean;
}

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

const COZY_QUOTES = [
  // Morning Motivation (1-50)
  "Good morning! Today is a fresh page in your story.",
  "Rise and shine—your habits are waiting to make you proud.",
  "Every morning is a chance to begin again.",
  "Wake up with purpose, go to bed with progress.",
  "The morning sun brings new opportunities for growth.",
  "Start your day with intention, end it with gratitude.",
  "Your morning routine sets the tone for your entire day.",
  "Good morning! Small steps today lead to big changes tomorrow.",
  "A cozy morning routine is self-love in action.",
  "Rise gently, move purposefully, grow steadily.",
  "Each sunrise whispers: you get another chance.",
  "Morning magic happens when you show up for yourself.",
  "The best mornings start with the habits that matter most.",
  "Wake up and remember: you are capable of amazing things.",
  "Your morning self is planting seeds for your evening self.",
  "Greet the day with kindness—starting with yourself.",
  "A peaceful morning creates a peaceful mind.",
  "The early hours are yours to shape however you wish.",
  "Good morning! Your future self is cheering you on.",
  "Start soft, stay consistent, finish strong.",
  "Every morning is a mini fresh start.",
  "The dawn brings hope, and your habits bring progress.",
  "Wake up grateful, work mindfully, rest peacefully.",
  "Your morning habits are your daily foundation.",
  "A gentle start leads to a powerful day.",
  "Good morning! Today is full of tiny victories waiting to happen.",
  "The sun rises, and so do you—one habit at a time.",
  "Morning routines are love letters to your future self.",
  "Start each day by tending to your growth.",
  "A cozy morning is the best gift you can give yourself.",
  "Rise with the sun and set your intentions with care.",
  "Your morning mindset shapes your whole day.",
  "Good morning! Be patient with yourself today.",
  "The first hour of your day belongs to you.",
  "Wake up and water your habits like a garden.",
  "Morning is the perfect time to be kind to yourself.",
  "Start the day believing something wonderful will happen.",
  "Your daily habits are building the life you dream of.",
  "Good morning! Progress over perfection, always.",
  "The quiet morning hours are where growth begins.",
  "Rise, stretch, breathe, and begin again.",
  "A mindful morning leads to a meaningful day.",
  "Wake up knowing you are worthy of your goals.",
  "Morning rituals are tiny acts of self-care.",
  "Start today by celebrating how far you have come.",
  "The morning light is cheering for your success.",
  "Good morning! Your consistency is your superpower.",
  "Each sunrise is an invitation to try again.",
  "Your morning habits are shaping who you are becoming.",
  "Wake up with hope, move with intention, rest with peace.",

  // Habit Building (51-100)
  "Small habits create big transformations.",
  "Consistency is the secret ingredient to success.",
  "Your habits today shape your tomorrow.",
  "One small step each day adds up to incredible progress.",
  "Habits are the compound interest of self-improvement.",
  "Show up for yourself, one habit at a time.",
  "The magic is in the daily practice.",
  "Your routine is your superpower.",
  "Build habits that make your future self proud.",
  "Progress happens in the small, quiet moments.",
  "Your daily habits are votes for the person you want to become.",
  "Consistency beats intensity every single time.",
  "Small daily improvements lead to stunning results.",
  "The habit you build today is the gift you give tomorrow.",
  "Trust the process and keep showing up.",
  "Your habits are the building blocks of your dreams.",
  "Every check mark is a step toward your best self.",
  "Routines create rhythm, and rhythm creates results.",
  "The power is in the repetition.",
  "Your habits reflect your priorities.",
  "One habit at a time, one day at a time.",
  "Small wins add up to major victories.",
  "Your future is built on what you do today.",
  "Habits are the invisible architecture of your life.",
  "Keep going—your habits are working even when you cannot see it.",
  "The best time to start was yesterday. The next best time is now.",
  "Discipline is choosing what you want most over what you want now.",
  "Your routine is a form of self-respect.",
  "Habits shape character, and character shapes destiny.",
  "Every habit you build is a promise kept to yourself.",
  "You do not rise to the level of your goals—you fall to the level of your habits.",
  "Start small, stay steady, grow strong.",
  "The days you do not feel like it are the days that matter most.",
  "Habits are the path from who you are to who you want to be.",
  "Your streak is proof of your dedication.",
  "Build the habit before you chase the result.",
  "What you repeat, you become.",
  "Your daily choices create your weekly wins.",
  "The secret to change is focusing on building new habits.",
  "Routine is not boring—routine is freedom.",
  "Small actions repeated consistently change everything.",
  "Your habits are speaking your future into existence.",
  "Stay patient. Your habits are compounding.",
  "The habit itself is the reward.",
  "Commit to the process, not just the outcome.",
  "Your consistency today writes your story tomorrow.",
  "Habits are proof that change is possible.",
  "Show up, do the work, trust the process.",
  "Every habit completed is self-love in action.",
  "Your routine is the framework for your dreams.",

  // Progress and Growth (101-150)
  "Progress, not perfection, is what matters.",
  "You are growing even when you cannot see it.",
  "Every step forward counts, no matter how small.",
  "Be proud of how far you have come.",
  "Growth is not always visible, but it is always happening.",
  "Your journey is unique—honor it.",
  "Celebrate the small wins along the way.",
  "You are exactly where you need to be right now.",
  "Trust your timing.",
  "Progress looks different for everyone.",
  "You are not behind—you are on your own path.",
  "Every effort you make matters.",
  "Growth happens one day at a time.",
  "Be patient with your progress.",
  "You are building something beautiful.",
  "The road to success is paved with small victories.",
  "Keep moving forward, even if it is slowly.",
  "Your growth is inspiring, even when you cannot see it.",
  "Trust the journey, even when you do not understand it.",
  "You are closer than you think.",
  "Every day is a chance to grow.",
  "Progress is progress, no matter the pace.",
  "You are becoming who you are meant to be.",
  "Bloom at your own pace.",
  "Your efforts are not wasted—they are compounding.",
  "Growth requires patience and persistence.",
  "You are doing better than you think.",
  "Every small step is a victory.",
  "Trust yourself—you have come so far.",
  "Your progress is proof of your strength.",
  "Keep going. Keep growing. Keep glowing.",
  "You are not the same person you were yesterday.",
  "Celebrate your evolution.",
  "Growth is uncomfortable, but so worth it.",
  "You are planting seeds for a beautiful future.",
  "Every challenge is an opportunity to grow.",
  "Your potential is limitless.",
  "Be proud of every step you take.",
  "Growth is a journey, not a destination.",
  "You are making progress every single day.",
  "Trust the process of becoming.",
  "Your hard work is paying off.",
  "Every effort adds up.",
  "You are on the right path.",
  "Growth happens in the small moments.",
  "Keep nurturing your dreams.",
  "You are stronger than you know.",
  "Progress is built on consistency.",
  "Your journey is beautiful.",
  "You are exactly enough, right now.",

  // Self-Care and Kindness (151-200)
  "Be gentle with yourself today.",
  "You deserve the same kindness you give others.",
  "Rest is productive too.",
  "Self-care is not selfish—it is necessary.",
  "You are worthy of love and care.",
  "Take a deep breath. You are doing great.",
  "Honor your need for rest.",
  "Be your own best friend.",
  "You do not have to be perfect to be worthy.",
  "Treat yourself with compassion.",
  "Your well-being matters.",
  "It is okay to take things slowly.",
  "You are allowed to prioritize yourself.",
  "Rest when you need to—it is part of the process.",
  "Be patient with your healing.",
  "You deserve moments of peace.",
  "Self-love is the best habit you can build.",
  "Take care of yourself like you would a good friend.",
  "Your mental health is just as important as your goals.",
  "It is okay to not be okay sometimes.",
  "You are worthy of good things.",
  "Give yourself grace today.",
  "You are enough, just as you are.",
  "Rest is not laziness—it is restoration.",
  "Be kind to yourself on the hard days.",
  "You deserve your own love and affection.",
  "Taking breaks is part of being productive.",
  "Your feelings are valid.",
  "Honor your energy levels.",
  "You are doing your best, and that is enough.",
  "Self-compassion is a strength.",
  "You do not need to earn rest.",
  "Be proud of yourself for showing up.",
  "Your well-being is your priority.",
  "It is okay to go at your own pace.",
  "You are worthy of happiness.",
  "Take care of the person who takes care of everything.",
  "Your needs matter.",
  "Be gentle with your expectations.",
  "You are deserving of peace.",
  "Self-care fuels your ability to care for others.",
  "You are allowed to put yourself first.",
  "Rest is how you recharge for tomorrow.",
  "Your heart deserves kindness.",
  "Be soft with yourself.",
  "You are more than your productivity.",
  "Taking time for yourself is never wasted.",
  "You deserve a life that feels good.",
  "Self-love is the foundation of all good habits.",
  "Be your own source of comfort.",

  // Encouragement and Positivity (201-250)
  "You have got this!",
  "Believe in yourself—you are capable of amazing things.",
  "Your best is always good enough.",
  "You are stronger than any obstacle.",
  "Keep going—brighter days are ahead.",
  "You are making a difference, even in small ways.",
  "Your light brightens the world.",
  "Never underestimate your own power.",
  "You are worthy of your dreams.",
  "The world is better because you are in it.",
  "You are resilient and brave.",
  "Your effort matters more than you know.",
  "Keep shining your beautiful light.",
  "You are capable of overcoming anything.",
  "Your presence is a gift.",
  "Believe in the magic within you.",
  "You are exactly who you need to be.",
  "Your potential is incredible.",
  "Keep believing in yourself.",
  "You have survived every hard day so far.",
  "You are a work of art in progress.",
  "Your dreams are within reach.",
  "You inspire others just by being you.",
  "Keep your head up—you are doing amazing.",
  "You are full of possibility.",
  "Your courage is showing.",
  "You are not alone on this journey.",
  "Keep trusting yourself.",
  "You have what it takes.",
  "Your heart is full of strength.",
  "You are braver than you believe.",
  "Keep pushing forward—you are almost there.",
  "You are worthy of success.",
  "Your dedication is admirable.",
  "You are creating something beautiful.",
  "Keep going—the best is yet to come.",
  "You are more capable than you realize.",
  "Your journey inspires others.",
  "You are a beacon of hope.",
  "Keep believing in your path.",
  "You are destined for great things.",
  "Your persistence will pay off.",
  "You are already successful in so many ways.",
  "Keep showing up—it matters.",
  "You are full of untapped potential.",
  "Your strength is inspiring.",
  "You are on your way to something wonderful.",
  "Keep being you—it is your superpower.",
  "You are worthy of all good things.",
  "Your future is bright.",

  // Mindfulness and Gratitude (251-300)
  "This moment is all you need.",
  "Breathe deeply. You are exactly where you should be.",
  "Find joy in the simple things.",
  "Gratitude turns what we have into enough.",
  "Be present. This moment is precious.",
  "Notice the beauty around you today.",
  "A grateful heart is a happy heart.",
  "Slow down and savor the moment.",
  "Mindfulness is a gift you give yourself.",
  "Find peace in the present.",
  "Every moment holds something to be grateful for.",
  "Breathe in calm, breathe out stress.",
  "The present moment is full of possibilities.",
  "Practice gratitude—it changes everything.",
  "Be here now. This moment matters.",
  "Find stillness in the busy.",
  "Gratitude is the best attitude.",
  "The little things are the big things.",
  "Be thankful for today.",
  "Mindful moments create mindful days.",
  "Pause. Breathe. Be grateful.",
  "Every day holds something worth appreciating.",
  "Find peace in the pause.",
  "Gratitude opens doors to abundance.",
  "Be present with what is.",
  "The now is where life happens.",
  "A moment of gratitude shifts your whole day.",
  "Slow down—life is not a race.",
  "Mindfulness is coming home to yourself.",
  "Be grateful for the journey.",
  "This moment is enough.",
  "Find joy in being, not just doing.",
  "Gratitude makes sense of our past and brings peace for today.",
  "Take a mindful breath.",
  "The present is a present.",
  "Appreciate how far you have come.",
  "Mindful living is intentional living.",
  "Gratitude is a daily practice.",
  "Be still and know you are enough.",
  "Find wonder in the ordinary.",
  "Every breath is a fresh start.",
  "Gratitude is the foundation of happiness.",
  "Slow moments are healing moments.",
  "Be thankful for the gift of today.",
  "Mindfulness brings clarity.",
  "Appreciate your own efforts.",
  "The present moment is always enough.",
  "Gratitude transforms everything it touches.",
  "Breathe. You are alive. That is beautiful.",
  "Find magic in the mundane.",
];


export function QuotesProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [currentQuote, setCurrentQuote] = useState('');
  const [quoteHistory, setQuoteHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const autoRotateTimer = useRef<NodeJS.Timeout>();

  const getRandomQuote = useCallback(() => {
    let availableIndices = Array.from(
      { length: COZY_QUOTES.length },
      (_, i) => i
    ).filter((i) => !usedIndices.has(i));

    // Reset if we've used all quotes
    if (availableIndices.length === 0) {
      setUsedIndices(new Set());
      availableIndices = Array.from({ length: COZY_QUOTES.length }, (_, i) => i);
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedIndices((prev) => new Set([...prev, randomIndex]));
    return COZY_QUOTES[randomIndex];
  }, [usedIndices]);

  const refreshQuote = useCallback(() => {
    const newQuote = getRandomQuote();
    setCurrentQuote(newQuote);
    setQuoteHistory((prev) => [...prev, newQuote]);
    setHistoryIndex((prev) => prev + 1);
  }, [getRandomQuote]);

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      setCurrentQuote(quoteHistory[historyIndex - 1]);
    }
  }, [historyIndex, quoteHistory]);

  const canGoBack = historyIndex > 0;

  // Auto-rotate quotes every 15 seconds
  useEffect(() => {
    autoRotateTimer.current = setInterval(() => {
      const newQuote = getRandomQuote();
      setCurrentQuote(newQuote);
      setQuoteHistory((prev) => [...prev, newQuote]);
      setHistoryIndex((prev) => prev + 1);
    }, 15000);

    return () => {
      if (autoRotateTimer.current) {
        clearInterval(autoRotateTimer.current);
      }
    };
  }, [getRandomQuote]);

  // Change quote on route change
  useEffect(() => {
    const newQuote = getRandomQuote();
    setCurrentQuote(newQuote);
    setQuoteHistory([newQuote]);
    setHistoryIndex(0);
  }, [location.pathname]);

  // Initial quote
  useEffect(() => {
    if (!currentQuote) {
      const initialQuote = getRandomQuote();
      setCurrentQuote(initialQuote);
      setQuoteHistory([initialQuote]);
      setHistoryIndex(0);
    }
  }, []);

  return (
    <QuotesContext.Provider value={{ currentQuote, refreshQuote, goBack, canGoBack }}>
      {children}
    </QuotesContext.Provider>
  );
}

export function useQuotes() {
  const context = useContext(QuotesContext);
  if (context === undefined) {
    throw new Error('useQuotes must be used within a QuotesProvider');
  }
  return context;
}
