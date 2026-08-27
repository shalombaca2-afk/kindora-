import React from 'react';
import { motion } from 'framer-motion';

type ProgressDotsProps = {
  total?: number;
  activeIndex?: number; // index of the last filled dot (0-based)
  size?: number; // px
  gap?: number; // px
  activeColor?: string;
  className?: string;
};

const ProgressDots: React.FC<ProgressDotsProps> = ({
  total = 5,
  activeIndex = 0,
  size = 10,
  gap = 8,
  activeColor = '#6366F1',
  className = '',
}) => {
  const dots = Array.from({ length: total });

  return (
    <div className={`flex items-center ${className}`} role="list" aria-label="Progress">
      {dots.map((_, i) => {
        const isActive = i <= activeIndex;
        return (
          <div
            key={i}
            role="listitem"
            aria-current={isActive ? 'true' : undefined}
            style={{ width: size, height: size, marginRight: i === total - 1 ? 0 : gap }}
          >
            <div className="relative w-full h-full rounded-full overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
              <motion.div
                initial={{ scale: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                animate={{
                  scale: isActive ? 1 : 0,
                  backgroundColor: isActive ? activeColor : 'rgba(0,0,0,0)',
                  opacity: isActive ? 1 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="absolute inset-0 rounded-full"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProgressDots;
