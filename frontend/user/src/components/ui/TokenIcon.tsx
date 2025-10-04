'use client';

import React from 'react';
import Image from 'next/image';

interface TokenIconProps {
  type: 'C12USD' | 'C12DAO';
  size?: number;
  className?: string;
}

export const TokenIcon: React.FC<TokenIconProps> = ({
  type,
  size = 32,
  className = '',
}) => {
  const iconSrc = type === 'C12USD' ? '/icons/c12usd.png' : '/icons/c12dao.svg';
  const alt = type === 'C12USD' ? 'C12USD Token' : 'C12DAO Token';

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={iconSrc}
        alt={alt}
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  );
};
