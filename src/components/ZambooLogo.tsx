import React from 'react';

interface Props {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ZambooLogo: React.FC<Props> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: { box: 'w-10 h-10', icon: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    md: { box: 'w-16 h-16', icon: 'w-12 h-12', text: 'text-xl', sub: 'text-[10px]' },
    lg: { box: 'w-20 h-20', icon: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Golden Hexagonal Honeybee Icon */}
      <div className="relative mb-2">
        <svg
          viewBox="0 0 100 90"
          className={`${currentSize.icon} drop-shadow-[0_0_12px_rgba(245,184,46,0.7)] text-[#F6BA35]`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Hexagonal Roof / Honeycomb frame */}
          <path
            d="M50 4L90 28V68L50 88L10 68V28L50 4Z"
            stroke="url(#goldGradient)"
            strokeWidth="3.2"
            strokeLinejoin="round"
            className="opacity-95"
          />
          {/* Roof rafters / internal structural lines */}
          <path
            d="M50 4V24M22 35L42 24M78 35L58 24"
            stroke="url(#goldGradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Bee Head & Antennae */}
          <circle cx="50" cy="36" r="5" fill="url(#goldGradient)" />
          <path
            d="M48 32C45 28 42 27 39 28M52 32C55 28 58 27 61 28"
            stroke="url(#goldGradient)"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Bee Wings - Left */}
          <path
            d="M44 42C30 38 20 44 24 55C27 63 38 60 44 48"
            stroke="url(#goldGradient)"
            strokeWidth="2.4"
            fill="rgba(245, 184, 46, 0.15)"
            strokeLinejoin="round"
          />
          <path
            d="M44 48C34 50 30 58 35 64C39 68 45 62 46 54"
            stroke="url(#goldGradient)"
            strokeWidth="1.8"
            fill="rgba(245, 184, 46, 0.1)"
          />

          {/* Bee Wings - Right */}
          <path
            d="M56 42C70 38 80 44 76 55C73 63 62 60 56 48"
            stroke="url(#goldGradient)"
            strokeWidth="2.4"
            fill="rgba(245, 184, 46, 0.15)"
            strokeLinejoin="round"
          />
          <path
            d="M56 48C66 50 70 58 65 64C61 68 55 62 54 54"
            stroke="url(#goldGradient)"
            strokeWidth="1.8"
            fill="rgba(245, 184, 46, 0.1)"
          />

          {/* Bee Thorax */}
          <ellipse cx="50" cy="45" rx="5.5" ry="5" fill="url(#goldGradient)" />

          {/* Bee Abdomen Stripes */}
          <path
            d="M45 52C45 52 47 50 50 50C53 50 55 52 55 52C55 55 45 55 45 52Z"
            fill="url(#goldGradient)"
          />
          <path
            d="M46 56C46 56 48 55 50 55C52 55 54 56 54 56C54 59 46 59 46 56Z"
            fill="url(#goldGradient)"
          />
          <path
            d="M47 60C47 60 48.5 59 50 59C51.5 59 53 60 53 60C53 63 47 63 47 60Z"
            fill="url(#goldGradient)"
          />
          <path
            d="M49 64L50 67L51 64H49Z"
            fill="url(#goldGradient)"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE07A" />
              <stop offset="50%" stopColor="#F6BA35" />
              <stop offset="100%" stopColor="#D98208" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Title */}
      <h1 className={`${currentSize.text} font-bold tracking-[0.16em] uppercase font-display text-transparent bg-clip-text bg-gradient-to-r from-[#FFE899] via-[#F6BA35] to-[#E59315] drop-shadow-sm`}>
        JACH SYSTEM
      </h1>

      {/* Subtitle */}
      <span className={`${currentSize.sub} tracking-[0.24em] font-medium text-amber-200/90 uppercase mt-0.5 text-center`}>
        Jambo Asali Commercial Hub
      </span>
    </div>
  );
};
