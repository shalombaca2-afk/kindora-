import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Vowel = 'A' | 'E' | 'I' | 'O' | 'U';

type VowelSelectorProps = {
  value?: Vowel;
  onChange?: (v: Vowel) => void;
  size?: 'sm' | 'md' | 'lg';
  activeColor?: string;
  className?: string;
};

const vowels: Vowel[] = ['A', 'E', 'I', 'O', 'U'];

const VowelSelector: React.FC<VowelSelectorProps> = ({
  value,
  onChange,
  size = 'md',
  activeColor = '#10B981', // emerald-500
  className = '',
}) => {
  const [selected, setSelected] = useState<Vowel>(value ?? 'A');

  useEffect(() => {
    if (value && value !== selected) setSelected(value);
  }, [value]);

  const fontSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';
  const padding = size === 'sm' ? 'px-2 py-1' : size === 'lg' ? 'px-4 py-2' : 'px-3 py-1.5';

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`} role="tablist" aria-label="Vowel selector">
      {vowels.map((v) => {
        const active = v === selected;
        return (
          <motion.button
            key={v}
            role="tab"
            aria-selected={active}
            onClick={() => {
              setSelected(v);
              onChange?.(v);
            }}
            whileTap={{ scale: 0.96 }}
            animate={{
              backgroundColor: active ? activeColor : 'rgba(0,0,0,0)',
              color: active ? '#ffffff' : '#111827',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className={`${fontSize} ${padding} rounded-lg border border-gray-200 dark:border-gray-700`}
            style={{
              outline: 'none',
            }}
          >
            {v}
          </motion.button>
        );
      })}
    </div>
  );
};

export default VowelSelector;
