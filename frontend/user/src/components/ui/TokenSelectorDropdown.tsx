'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import { TokenIcon } from './TokenIcon';
import { GlassButton } from './GlassButton';

export type TokenType = 'C12USD' | 'C12DAO';

interface Token {
  type: TokenType;
  name: string;
  price: string;
  gradient: string;
}

interface TokenSelectorDropdownProps {
  onBuyClick: (tokenType: TokenType) => void;
  className?: string;
}

const tokens: Token[] = [
  {
    type: 'C12USD',
    name: 'C12USD',
    price: '$1.00',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    type: 'C12DAO',
    name: 'C12DAO',
    price: '$3.30',
    gradient: 'from-blue-500 to-pink-500',
  },
];

export const TokenSelectorDropdown: React.FC<TokenSelectorDropdownProps> = ({
  onBuyClick,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBuyClick = (tokenType: TokenType) => {
    setIsOpen(false);
    onBuyClick(tokenType);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-4 py-2 rounded-lg
          bg-white/25 backdrop-blur-md border border-white/30
          hover:bg-white/35 transition-all duration-200
          text-gray-900 font-medium
        "
      >
        <div className="flex items-center gap-2">
          <TokenIcon type="C12USD" size={20} />
          <span className="hidden sm:inline">Tokens</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="
          absolute top-full right-0 mt-2 w-80
          bg-white/90 backdrop-blur-xl border border-white/40
          rounded-xl shadow-2xl z-[100]
          animate-in fade-in slide-in-from-top-2 duration-200
          pointer-events-auto
        ">
          <div className="p-3 space-y-2">
            {tokens.map((token) => (
              <div
                key={token.type}
                className="
                  flex items-center gap-3 p-3 rounded-lg
                  bg-white/50 hover:bg-white/70
                  border border-white/30
                  transition-all duration-200
                  group
                "
              >
                {/* Token Icon */}
                <div className="relative">
                  <TokenIcon type={token.type} size={40} />
                </div>

                {/* Token Info */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <h3 className={`text-lg font-bold bg-gradient-to-r ${token.gradient} bg-clip-text text-transparent`}>
                      {token.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">{token.price}</p>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => handleBuyClick(token.type)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-gradient-to-r ${token.gradient}
                    text-white font-medium text-sm
                    hover:shadow-lg hover:scale-105
                    transition-all duration-200
                    group-hover:shadow-xl
                  `}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-b-xl border-t border-white/30">
            <p className="text-xs text-gray-600 text-center">
              Pay with Cash App or Stablecoins • Instant delivery
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
