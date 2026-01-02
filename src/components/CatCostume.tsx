import { memo } from 'react';

export type CostumeType = 
  | 'none'
  | 'scarf'
  | 'wizard_hat'
  | 'sleep_cap'
  | 'raincoat'
  | 'headphones'
  | 'flower_crown'
  | 'bow_tie'
  | 'santa_hat'
  | 'crown'
  | 'winter_beanie'
  | 'sunhat'
  | 'sweater'
  | 'cape'
  | 'party_hat'
  | 'bunny_ears'
  | 'pirate_hat'
  | 'chef_hat'
  | 'detective_hat'
  | 'angel_halo';

interface CatCostumeProps {
  costume: CostumeType;
  isDark?: boolean;
}

// SVG costume components that overlay on the cat
export const CatCostume = memo(({ costume, isDark = false }: CatCostumeProps) => {
  if (costume === 'none') return null;

  const renderCostume = () => {
    switch (costume) {
      case 'scarf':
        return (
          <g className="animate-costume-in">
            <ellipse cx="32" cy="38" rx="13" ry="4" fill="#f87171" />
            <ellipse cx="32" cy="38" rx="11" ry="3" fill="#fca5a5" />
            <path d="M19 38 Q15 42 16 48 Q17 52 14 56" stroke="#f87171" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M19 38 Q15 42 16 48 Q17 52 14 56" stroke="#fca5a5" strokeWidth="3" strokeLinecap="round" fill="none" />
            <line x1="22" y1="37" x2="22" y2="39" stroke="#dc2626" strokeWidth="1" />
            <line x1="27" y1="37" x2="27" y2="39" stroke="#dc2626" strokeWidth="1" />
            <line x1="32" y1="37" x2="32" y2="39" stroke="#dc2626" strokeWidth="1" />
            <line x1="37" y1="37" x2="37" y2="39" stroke="#dc2626" strokeWidth="1" />
            <line x1="42" y1="37" x2="42" y2="39" stroke="#dc2626" strokeWidth="1" />
          </g>
        );

      case 'wizard_hat':
        return (
          <g className="animate-costume-in">
            <path d="M20 20 L32 -2 L44 20 Z" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
            <ellipse cx="32" cy="20" rx="14" ry="3" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1" />
            <text x="28" y="10" className="text-[6px] fill-yellow-300">★</text>
            <text x="34" y="14" className="text-[5px] fill-yellow-200">✦</text>
            <text x="25" y="16" className="text-[4px] fill-yellow-100">✧</text>
          </g>
        );

      case 'raincoat':
        return (
          <g className="animate-costume-in">
            <path d="M18 24 Q18 14 32 12 Q46 14 46 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <ellipse cx="32" cy="24" rx="14" ry="3" fill="#fcd34d" />
            <path d="M18 36 L18 52 L46 52 L46 36" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="32" cy="42" r="1.5" fill="#f59e0b" />
            <circle cx="32" cy="48" r="1.5" fill="#f59e0b" />
            <ellipse cx="26" cy="52" rx="5" ry="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <ellipse cx="38" cy="52" rx="5" ry="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
          </g>
        );

      case 'sleep_cap':
        return (
          <g className="animate-costume-in">
            <path d="M18 22 Q18 12 32 10 Q46 12 46 22" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="1" />
            <path d="M46 20 Q52 18 54 26 Q52 32 48 28" fill="#c4b5fd" stroke="#a78bfa" strokeWidth="1" />
            <circle cx="54" cy="26" r="4" fill="#ddd6fe" />
            <circle cx="53" cy="25" r="1" fill="#ede9fe" />
          </g>
        );

      case 'headphones':
        return (
          <g className="animate-costume-in">
            <path d="M18 24 Q18 10 32 8 Q46 10 46 24" fill="none" stroke="#374151" strokeWidth="3" />
            <ellipse cx="16" cy="26" rx="5" ry="6" fill="#374151" />
            <ellipse cx="16" cy="26" rx="3" ry="4" fill="#6b7280" />
            <ellipse cx="48" cy="26" rx="5" ry="6" fill="#374151" />
            <ellipse cx="48" cy="26" rx="3" ry="4" fill="#6b7280" />
            <ellipse cx="16" cy="26" rx="2" ry="3" fill="#9ca3af" />
            <ellipse cx="48" cy="26" rx="2" ry="3" fill="#9ca3af" />
          </g>
        );

      case 'flower_crown':
        return (
          <g className="animate-costume-in">
            <path d="M18 18 Q25 14 32 16 Q39 14 46 18" fill="none" stroke="#22c55e" strokeWidth="2" />
            <g transform="translate(20, 14)">
              <circle cx="0" cy="0" r="3" fill="#f9a8d4" />
              <circle cx="0" cy="0" r="1.5" fill="#fcd34d" />
            </g>
            <g transform="translate(32, 12)">
              <circle cx="0" cy="0" r="4" fill="#fca5a5" />
              <circle cx="0" cy="0" r="2" fill="#fcd34d" />
            </g>
            <g transform="translate(44, 14)">
              <circle cx="0" cy="0" r="3" fill="#c4b5fd" />
              <circle cx="0" cy="0" r="1.5" fill="#fcd34d" />
            </g>
            <ellipse cx="26" cy="16" rx="2" ry="1" fill="#86efac" />
            <ellipse cx="38" cy="16" rx="2" ry="1" fill="#86efac" />
          </g>
        );

      case 'bow_tie':
        return (
          <g className="animate-costume-in">
            <path d="M24 38 L28 36 L28 40 Z" fill="#ec4899" />
            <path d="M40 38 L36 36 L36 40 Z" fill="#ec4899" />
            <circle cx="32" cy="38" r="2" fill="#be185d" />
            <ellipse cx="26" cy="38" rx="4" ry="3" fill="#f472b6" />
            <ellipse cx="38" cy="38" rx="4" ry="3" fill="#f472b6" />
          </g>
        );

      case 'santa_hat':
        return (
          <g className="animate-costume-in">
            <path d="M18 22 Q20 8 38 6 Q52 10 50 22" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
            <ellipse cx="32" cy="22" rx="15" ry="4" fill="#fafafa" />
            <circle cx="50" cy="10" r="5" fill="#fafafa" />
            <circle cx="49" cy="9" r="2" fill="#f5f5f5" />
          </g>
        );

      case 'crown':
        return (
          <g className="animate-costume-in">
            <rect x="20" y="16" width="24" height="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" rx="1" />
            <polygon points="22,16 26,8 30,16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <polygon points="29,16 32,6 35,16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <polygon points="34,16 38,8 42,16" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="26" cy="11" r="1.5" fill="#ef4444" />
            <circle cx="32" cy="9" r="2" fill="#3b82f6" />
            <circle cx="38" cy="11" r="1.5" fill="#22c55e" />
            <circle cx="26" cy="20" r="1" fill="#c4b5fd" />
            <circle cx="32" cy="20" r="1.5" fill="#fca5a5" />
            <circle cx="38" cy="20" r="1" fill="#c4b5fd" />
          </g>
        );

      case 'winter_beanie':
        return (
          <g className="animate-costume-in">
            <path d="M18 22 Q18 10 32 8 Q46 10 46 22" fill="#3b82f6" stroke="#2563eb" strokeWidth="1" />
            <ellipse cx="32" cy="22" rx="14" ry="3" fill="#60a5fa" />
            <path d="M20 14 Q26 12 32 14 Q38 12 44 14" stroke="#93c5fd" strokeWidth="2" fill="none" />
            <path d="M22 18 Q27 16 32 18 Q37 16 42 18" stroke="#93c5fd" strokeWidth="1.5" fill="none" />
            <circle cx="32" cy="5" r="4" fill="#93c5fd" />
            <circle cx="31" cy="4" r="1.5" fill="#bfdbfe" />
          </g>
        );

      case 'sunhat':
        return (
          <g className="animate-costume-in">
            <ellipse cx="32" cy="14" rx="10" ry="6" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1" />
            <ellipse cx="32" cy="18" rx="18" ry="4" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1" />
            <ellipse cx="32" cy="14" rx="9" ry="5" fill="none" stroke="#f472b6" strokeWidth="2" />
            <circle cx="44" cy="14" r="2" fill="#f472b6" />
            <circle cx="47" cy="13" r="1.5" fill="#f9a8d4" />
          </g>
        );

      case 'sweater':
        return (
          <g className="animate-costume-in">
            <path d="M18 34 L18 54 L46 54 L46 34 Q32 32 18 34" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
            <ellipse cx="32" cy="36" rx="8" ry="3" fill="#16a34a" />
            <path d="M20 42 L24 38 L28 42 L32 38 L36 42 L40 38 L44 42" stroke="#86efac" strokeWidth="1.5" fill="none" />
            <path d="M20 48 L24 44 L28 48 L32 44 L36 48 L40 44 L44 48" stroke="#86efac" strokeWidth="1.5" fill="none" />
          </g>
        );

      case 'cape':
        return (
          <g className="animate-costume-in">
            <path d="M18 28 Q16 40 20 56 L44 56 Q48 40 46 28" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
            <path d="M20 30 Q18 42 22 54 L42 54 Q46 42 44 30" fill="#7c3aed" />
            <circle cx="32" cy="30" r="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <circle cx="32" cy="30" r="1.5" fill="#fcd34d" />
            <path d="M24 28 Q28 24 32 28 Q36 24 40 28" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
          </g>
        );

      case 'party_hat':
        return (
          <g className="animate-costume-in">
            <path d="M22 22 L32 2 L42 22 Z" fill="#ec4899" stroke="#db2777" strokeWidth="1" />
            <path d="M26 18 L30 8" stroke="#f9a8d4" strokeWidth="2" />
            <path d="M34 18 L38 8" stroke="#a855f7" strokeWidth="2" />
            <circle cx="32" cy="2" r="3" fill="#fbbf24" />
            <circle cx="31" cy="1" r="1" fill="#fcd34d" />
            <ellipse cx="32" cy="22" rx="10" ry="2" fill="#ec4899" stroke="#db2777" strokeWidth="1" />
            <circle cx="25" cy="14" r="1" fill="#22c55e" />
            <circle cx="38" cy="12" r="1" fill="#3b82f6" />
            <circle cx="30" cy="16" r="0.8" fill="#fbbf24" />
          </g>
        );

      case 'bunny_ears':
        return (
          <g className="animate-costume-in">
            {/* Left bunny ear */}
            <ellipse cx="24" cy="6" rx="4" ry="12" fill="#f9a8d4" stroke="#f472b6" strokeWidth="1" />
            <ellipse cx="24" cy="6" rx="2" ry="8" fill="#fce7f3" />
            {/* Right bunny ear */}
            <ellipse cx="40" cy="6" rx="4" ry="12" fill="#f9a8d4" stroke="#f472b6" strokeWidth="1" />
            <ellipse cx="40" cy="6" rx="2" ry="8" fill="#fce7f3" />
            {/* Headband */}
            <path d="M18 18 Q25 14 32 16 Q39 14 46 18" fill="none" stroke="#f472b6" strokeWidth="3" />
          </g>
        );

      case 'pirate_hat':
        return (
          <g className="animate-costume-in">
            {/* Hat base */}
            <path d="M14 22 Q18 12 32 10 Q46 12 50 22 L14 22 Z" fill="#1f2937" stroke="#111827" strokeWidth="1" />
            {/* Hat top curve */}
            <path d="M18 22 Q22 16 32 14 Q42 16 46 22" fill="#374151" />
            {/* Skull and crossbones */}
            <circle cx="32" cy="18" r="3" fill="#fafafa" />
            <ellipse cx="30" cy="17" rx="0.8" ry="1" fill="#1f2937" />
            <ellipse cx="34" cy="17" rx="0.8" ry="1" fill="#1f2937" />
            <path d="M30 20 L34 20" stroke="#1f2937" strokeWidth="0.5" />
            {/* Crossbones */}
            <line x1="26" y1="16" x2="38" y2="20" stroke="#fafafa" strokeWidth="1.5" />
            <line x1="26" y1="20" x2="38" y2="16" stroke="#fafafa" strokeWidth="1.5" />
          </g>
        );

      case 'chef_hat':
        return (
          <g className="animate-costume-in">
            {/* Chef hat puff */}
            <ellipse cx="32" cy="8" rx="12" ry="8" fill="#fafafa" stroke="#e5e7eb" strokeWidth="1" />
            <circle cx="26" cy="6" r="4" fill="#fafafa" />
            <circle cx="38" cy="6" r="4" fill="#fafafa" />
            <circle cx="32" cy="4" r="4" fill="#fafafa" />
            {/* Hat band */}
            <rect x="20" y="14" width="24" height="6" fill="#fafafa" stroke="#e5e7eb" strokeWidth="1" />
          </g>
        );

      case 'detective_hat':
        return (
          <g className="animate-costume-in">
            {/* Hat body */}
            <path d="M18 22 Q18 14 32 12 Q46 14 46 22" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            {/* Front brim */}
            <ellipse cx="32" cy="22" rx="16" ry="3" fill="#78350f" stroke="#451a03" strokeWidth="1" />
            {/* Hat band */}
            <rect x="20" y="16" width="24" height="3" fill="#451a03" />
            {/* Magnifying glass accessory */}
            <circle cx="48" cy="28" r="4" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
            <line x1="51" y1="31" x2="54" y2="34" stroke="#78350f" strokeWidth="2" />
          </g>
        );

      case 'angel_halo':
        return (
          <g className="animate-costume-in">
            {/* Halo ring */}
            <ellipse cx="32" cy="8" rx="12" ry="3" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <ellipse cx="32" cy="8" rx="10" ry="2" fill="none" stroke="#fcd34d" strokeWidth="1" />
            {/* Glow effect */}
            <ellipse cx="32" cy="8" rx="14" ry="4" fill="none" stroke="#fef3c7" strokeWidth="1" opacity="0.5" />
            {/* Sparkles */}
            <text x="20" y="6" className="text-[4px] fill-yellow-300">✦</text>
            <text x="42" y="10" className="text-[3px] fill-yellow-200">✧</text>
            <text x="32" y="4" className="text-[3px] fill-yellow-100">✦</text>
          </g>
        );

      default:
        return null;
    }
  };

  return renderCostume();
});

CatCostume.displayName = 'CatCostume';

// Costume metadata for the picker UI
export const COSTUME_DATA: Record<CostumeType, { name: string; description: string; category: string; price: number }> = {
  none: { name: 'No Costume', description: 'Just your adorable cat', category: 'default', price: 0 },
  scarf: { name: 'Cozy Scarf', description: 'A warm knit scarf for chilly days', category: 'accessory', price: 100 },
  wizard_hat: { name: 'Wizard Hat', description: 'Magical and mystical', category: 'hat', price: 200 },
  raincoat: { name: 'Raincoat & Boots', description: 'Stay dry in style', category: 'outfit', price: 220 },
  sleep_cap: { name: 'Sleepy Nightcap', description: 'Perfect for cozy nights', category: 'hat', price: 150 },
  headphones: { name: 'Headphones', description: 'Listening to lo-fi beats', category: 'accessory', price: 180 },
  flower_crown: { name: 'Flower Crown', description: 'Spring vibes all year', category: 'hat', price: 160 },
  bow_tie: { name: 'Bow Tie', description: 'Looking fancy!', category: 'accessory', price: 80 },
  santa_hat: { name: 'Santa Hat', description: 'Ho ho ho! Festive spirit', category: 'hat', price: 120 },
  crown: { name: 'Royal Crown', description: 'Your cat is royalty', category: 'hat', price: 250 },
  winter_beanie: { name: 'Winter Beanie', description: 'Stay warm and stylish', category: 'hat', price: 140 },
  sunhat: { name: 'Summer Sunhat', description: 'Perfect for sunny days', category: 'hat', price: 130 },
  sweater: { name: 'Cozy Sweater', description: 'Warm and snuggly knit', category: 'outfit', price: 200 },
  cape: { name: 'Hero Cape', description: 'Superhero vibes!', category: 'outfit', price: 280 },
  party_hat: { name: 'Party Hat', description: 'Celebrate every day!', category: 'hat', price: 100 },
  bunny_ears: { name: 'Bunny Ears', description: 'Hop into cuteness', category: 'hat', price: 150 },
  pirate_hat: { name: 'Pirate Hat', description: 'Arrr! Adventure awaits', category: 'hat', price: 180 },
  chef_hat: { name: 'Chef Hat', description: 'Master of the kitchen', category: 'hat', price: 160 },
  detective_hat: { name: 'Detective Hat', description: 'Solving mysteries', category: 'hat', price: 190 },
  angel_halo: { name: 'Angel Halo', description: 'Heavenly accessory', category: 'accessory', price: 300 },
};

// Map database costume names to CostumeType
export const DB_TO_COSTUME_MAP: Record<string, CostumeType> = {
  'Cozy Scarf': 'scarf',
  'Wizard Hat': 'wizard_hat',
  'Raincoat & Boots': 'raincoat',
  'Sleepy Nightcap': 'sleep_cap',
  'Headphones': 'headphones',
  'Flower Crown': 'flower_crown',
  'Bow Tie': 'bow_tie',
  'Santa Hat': 'santa_hat',
  'Royal Crown': 'crown',
  'Winter Beanie': 'winter_beanie',
  'Summer Sunhat': 'sunhat',
  'Cozy Sweater': 'sweater',
  'Hero Cape': 'cape',
  'Party Hat': 'party_hat',
  'Bunny Ears': 'bunny_ears',
  'Pirate Hat': 'pirate_hat',
  'Chef Hat': 'chef_hat',
  'Detective Hat': 'detective_hat',
  'Angel Halo': 'angel_halo',
};

// Get CostumeType from database name
export const getCostumeTypeFromDB = (name: string): CostumeType => {
  return DB_TO_COSTUME_MAP[name] || 'none';
};

// Get all available costume types (excluding 'none')
export const ALL_COSTUME_TYPES: CostumeType[] = [
  'scarf', 'bow_tie', 'headphones', 'santa_hat', 'winter_beanie', 'party_hat',
  'sunhat', 'sleep_cap', 'flower_crown', 'wizard_hat', 'bunny_ears', 'pirate_hat',
  'chef_hat', 'detective_hat', 'sweater', 'raincoat', 'cape', 'crown', 'angel_halo'
];

export default CatCostume;
