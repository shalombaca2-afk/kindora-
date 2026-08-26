import React from 'react';

interface KindoraIconProps {
  className?: string;
  size?: number | string;
}

/**
 * Kindora stylized 'K' mascot with smiling star and floating heart
 * Perfectly matching the official Kindora brand identity
 */
export const KindoraIcon: React.FC<KindoraIconProps> = ({ className = 'w-10 h-10', size }) => {
  const dimension = size ? (typeof size === 'number' ? `${size}px` : size) : undefined;

  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={dimension ? { width: dimension, height: dimension } : undefined}
      aria-label="Kindora Logo"
    >
      <defs>
        {/* Gradients for smooth, vibrant brand colors */}
        <linearGradient id="kindora-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#58C0E8" />
          <stop offset="100%" stopColor="#48A6DB" />
        </linearGradient>
        
        <linearGradient id="kindora-loop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#62C6EC" />
          <stop offset="100%" stopColor="#4298CE" />
        </linearGradient>

        <linearGradient id="kindora-star" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FED246" />
          <stop offset="100%" stopColor="#F9AF24" />
        </linearGradient>

        <linearGradient id="kindora-orange" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB943E" />
          <stop offset="100%" stopColor="#F07A2B" />
        </linearGradient>

        <linearGradient id="kindora-coral" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="100%" stopColor="#EE4B4B" />
        </linearGradient>

        <linearGradient id="kindora-heart" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FA6D6D" />
          <stop offset="100%" stopColor="#EB4444" />
        </linearGradient>
        
        {/* Soft shadow filter for depth */}
        <filter id="soft-shadow" x="-10%" y="-10%" width="125%" height="125%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0f3e6d" floodOpacity="0.08" />
        </filter>
      </defs>

      <g filter="url(#soft-shadow)">
        {/* 1. Left Vertical Stem of 'K' (Sky Blue rounded pillar) */}
        <rect
          x="44"
          y="42"
          width="25"
          height="116"
          rx="12.5"
          fill="url(#kindora-sky)"
        />

        {/* 2. Lower Leg of 'K' (Warm Orange Curved Branch) */}
        <path
          d="M74 100 C 82 118, 96 138, 120 148 C 128 152, 137 146, 137 137 C 137 130, 132 124, 124 118 C 104 103, 90 92, 74 100 Z"
          fill="url(#kindora-orange)"
        />

        {/* 3. Upper Arm of 'K' - Smiling Star (Golden Sunshine Yellow) */}
        {/* Chubby friendly star body */}
        <path
          d="M75 94 C 82 82, 94 62, 114 46 C 120 41, 128 44, 128 52 C 129 60, 136 67, 145 68 C 153 69, 157 77, 153 84 C 149 92, 150 102, 157 108 C 163 114, 160 123, 152 124 C 144 125, 138 132, 137 140 C 135 147, 127 150, 122 145 C 108 132, 94 116, 75 94 Z"
          fill="url(#kindora-star)"
        />

        {/* 4. Ribbon Loop crossing the middle (Light Blue to Coral transition) */}
        <path
          d="M 56 100 C 35 100, 22 84, 22 68 C 22 52, 38 42, 54 54 C 64 62, 72 78, 86 96 C 96 109, 108 128, 114 138 C 117 143, 112 148, 106 145 C 96 140, 84 126, 74 112 C 67 103, 62 100, 56 100 Z"
          fill="url(#kindora-loop)"
          opacity="0.95"
        />

        {/* Overlay Ribbon Segment in Coral Red */}
        <path
          d="M 72 100 C 80 110, 92 126, 106 138 C 111 142, 116 139, 114 134 C 106 122, 95 108, 86 98 C 80 91, 74 94, 72 100 Z"
          fill="url(#kindora-coral)"
        />

        {/* 5. Inner Negative Space Circle / Loop hole in blue stem */}
        <circle cx="44" cy="74" r="8" fill="#FBFBFB" />

        {/* 6. Star Face Details: Happy Arched Eyes & Warm Smile */}
        {/* Left eye: arched closed smile */}
        <path
          d="M 119 86 C 121 82, 126 82, 128 86"
          stroke="#475569"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right eye: arched closed smile */}
        <path
          d="M 137 81 C 139 77, 144 77, 146 81"
          stroke="#475569"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Cheerful open curved smile */}
        <path
          d="M 124 96 C 128 103, 137 101, 142 93"
          stroke="#475569"
          strokeWidth="3.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Soft Rosy Cheeks */}
        <ellipse cx="117" cy="93" rx="3.5" ry="2.2" fill="#F472B6" opacity="0.5" />
        <ellipse cx="147" cy="88" rx="3.5" ry="2.2" fill="#F472B6" opacity="0.5" />

        {/* 7. Floating Heart above the top-right of Star (Coral-Red) */}
        <g transform="translate(142, 24) rotate(14) scale(0.85)">
          <path
            d="M 18 10 C 18 4, 12 0, 6 2 C 0 4, 0 12, 4 18 C 8 24, 18 32, 18 32 C 18 32, 28 24, 32 18 C 36 12, 36 4, 30 2 C 24 0, 18 4, 18 10 Z"
            fill="url(#kindora-heart)"
          />
        </g>
      </g>
    </svg>
  );
};

interface KindoraWordmarkProps {
  className?: string;
  showSlogan?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Kindora colorful custom typography wordmark
 * K (Sky Blue), i (Sky Blue), N (Yellow), D (Orange), O (Coral Red), R (Sky Blue), A (Sky Blue)
 */
export const KindoraWordmark: React.FC<KindoraWordmarkProps> = ({
  className = '',
  showSlogan = true,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: {
      letters: 'text-xl sm:text-2xl',
      slogan: 'text-[9px] tracking-[0.16em]',
    },
    md: {
      letters: 'text-2xl sm:text-3xl',
      slogan: 'text-[10px] sm:text-[11px] tracking-[0.18em]',
    },
    lg: {
      letters: 'text-4xl sm:text-5xl',
      slogan: 'text-xs sm:text-sm tracking-[0.2em]',
    },
    xl: {
      letters: 'text-5xl sm:text-7xl',
      slogan: 'text-sm sm:text-base tracking-[0.24em]',
    },
  };

  const selectedSize = sizeClasses[size];

  return (
    <div className={`flex flex-col select-none ${className}`}>
      <div className={`font-black font-display tracking-tight flex items-baseline leading-none ${selectedSize.letters}`}>
        <span className="text-[#4FA8DE]">K</span>
        <span className="text-[#4FA8DE]">i</span>
        <span className="text-[#FAB733]">N</span>
        <span className="text-[#F68535]">D</span>
        <span className="text-[#F0655E]">O</span>
        <span className="text-[#4FA8DE]">R</span>
        <span className="text-[#4FA8DE]">A</span>
      </div>

      {showSlogan && (
        <span className={`font-black text-[#54B2E6] uppercase font-display mt-0.5 whitespace-nowrap ${selectedSize.slogan}`}>
          CRECIENDO CON IMAGINACIÓN
        </span>
      )}
    </div>
  );
};

interface KindoraLogoProps {
  variant?: 'full' | 'horizontal' | 'icon-only' | 'wordmark-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * Main Kindora Master Logo Component
 */
export const KindoraLogo: React.FC<KindoraLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  showSlogan = true,
  className = '',
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10 sm:w-12 sm:h-12',
    lg: 'w-16 h-16 sm:w-20 sm:h-20',
    xl: 'w-24 h-24 sm:w-32 sm:h-32',
  };

  const content = () => {
    if (variant === 'icon-only') {
      return <KindoraIcon className={iconSizes[size]} />;
    }

    if (variant === 'wordmark-only') {
      return <KindoraWordmark size={size} showSlogan={showSlogan} />;
    }

    if (variant === 'full') {
      return (
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <div className="transform hover:scale-105 transition-transform duration-300">
            <KindoraIcon className={iconSizes[size]} />
          </div>
          <KindoraWordmark size={size} showSlogan={showSlogan} className="items-center text-center" />
        </div>
      );
    }

    // Default: 'horizontal'
    return (
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        <div className="shrink-0 transform group-hover:scale-105 transition-transform duration-200">
          <KindoraIcon className={iconSizes[size]} />
        </div>
        <KindoraWordmark size={size} showSlogan={showSlogan} />
      </div>
    );
  };

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`group text-left inline-flex items-center cursor-pointer transition-all active:scale-95 focus:outline-hidden ${className}`}
        aria-label="Kindora - Inicio"
      >
        {content()}
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      {content()}
    </div>
  );
};
