import React from 'react';
import { motion } from 'framer-motion';

type AnimatedIllustrationProps = {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

const AnimatedIllustration: React.FC<AnimatedIllustrationProps> = ({
  children,
  className = '',
  onClick,
  ariaLabel = 'Illustration',
}) => {
  return (
    <motion.div
      role="img"
      aria-label={ariaLabel}
      onClick={onClick}
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22, mass: 0.6 }}
      style={{ originX: 0.5, originY: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedIllustration;
