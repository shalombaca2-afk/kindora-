import React from 'react';

interface GameCardProps {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

const GameCard: React.FC<GameCardProps> = ({
  title,
  subtitle,
  imageSrc,
  imageAlt = '',
  onClick,
  className = '',
  children,
}) => {
  return (
    <article
      onClick={onClick}
      role="article"
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 overflow-hidden border border-transparent ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {imageSrc && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={imageSrc} alt={imageAlt} className="w-full h-40 object-cover" />
        </div>
      )}

      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      )}

      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{subtitle}</p>
      )}

      <div className="text-sm text-gray-700 dark:text-gray-200">{children}</div>
    </article>
  );
};

export default GameCard;
