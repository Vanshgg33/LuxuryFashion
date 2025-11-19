import React from 'react';
import type { Product, BackendProduct } from '../api/base';

interface SizeSelectorProps {
  product: Product | BackendProduct;
  selectedSize: string | null;
  onSizeSelect: (size: string) => void;
  quantity?: number;
  className?: string;
}

// Helper functions
export const getAvailableQuantity = (product: Product | BackendProduct, size: string): number => {
  try {
    if (!product) return 0;
    const sizes = (product as any).sizes;
    if (!sizes || typeof sizes !== 'object' || !sizes[size]) return 0;
    
    const totalQuantity = sizes[size] || 0;
    const reservedQuantity = (product as any).reservedSizes?.[size] || 0;
    return Math.max(0, totalQuantity - reservedQuantity);
  } catch (error) {
    console.error('Error calculating available quantity:', error);
    return 0;
  }
};

export const isSizeAvailable = (product: Product | BackendProduct, size: string, requestedQuantity: number = 1): boolean => {
  try {
    return getAvailableQuantity(product, size) >= requestedQuantity;
  } catch (error) {
    console.error('Error checking size availability:', error);
    return false;
  }
};

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  product,
  selectedSize,
  onSizeSelect,
  quantity = 1,
  className = ''
}) => {
  // Guard against null/undefined product
  if (!product) {
    return null;
  }

  const sizeOptions = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
    '28', '30', '32', '34', '36', '38', '40', '42', '44', '46', '48', '50', '52',
    'One Size'
  ];

  const sizes = (product as any).sizes;
  const hasSizes = sizes && typeof sizes === 'object' && Object.keys(sizes).length > 0;

  // If product has sizes defined, show only available sizes
  if (hasSizes) {
    const availableSizes = sizeOptions.filter(size => 
      sizes[size] && sizes[size] > 0
    );

    if (availableSizes.length === 0) {
      return (
        <div className={`size-selector ${className}`}>
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Select Size
          </label>
          <p className="text-sm text-gray-500">Currently Unavailable</p>
        </div>
      );
    }

    return (
      <div className={`size-selector ${className}`}>
        <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          Select Size <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {availableSizes.map(size => {
            const availableQty = getAvailableQuantity(product, size);
            const isAvailable = isSizeAvailable(product, size, quantity);
            const isLowStock = availableQty <= 5 && availableQty > 0;

            return (
              <button
                key={size}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (isAvailable && onSizeSelect) {
                    try {
                      onSizeSelect(size);
                    } catch (error) {
                      console.error('Error selecting size:', error);
                    }
                  }
                }}
                disabled={!isAvailable}
                title={
                  !isAvailable 
                    ? `Only ${availableQty} available` 
                    : `${availableQty} available`
                }
                className={`
                  px-4 sm:px-6 py-2 sm:py-2.5 border-2 transition-all duration-300 text-sm sm:text-base font-medium
                  ${selectedSize === size
                    ? 'border-black bg-black text-white'
                    : isAvailable
                      ? 'border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50'
                      : 'border-gray-200 text-gray-400 opacity-50 cursor-not-allowed line-through'
                  }
                  ${isLowStock && isAvailable ? 'ring-2 ring-orange-200' : ''}
                `}
              >
                {size}
                {isLowStock && isAvailable && (
                  <span className="ml-1 text-xs text-orange-600 font-normal">
                    ({availableQty})
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {selectedSize && (
          <p className="mt-3 text-sm text-gray-600">
            {getAvailableQuantity(product, selectedSize)} available in size {selectedSize}
          </p>
        )}
        {!selectedSize && (
          <p className="mt-2 text-sm text-amber-600 font-medium">
            Please select a size to add this item to your cart.
          </p>
        )}
      </div>
    );
  }

  // If product doesn't have sizes defined, show "One Size" option
  return (
    <div className={`size-selector ${className}`}>
      <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        Size
      </label>
      <div className="flex flex-wrap gap-2 sm:gap-3">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (onSizeSelect) {
              try {
                onSizeSelect('One Size');
              } catch (error) {
                console.error('Error selecting size:', error);
              }
            }
          }}
          className={`
            px-4 sm:px-6 py-2 sm:py-2.5 border-2 transition-all duration-300 text-sm sm:text-base font-medium
            ${selectedSize === 'One Size'
              ? 'border-black bg-black text-white'
              : 'border-gray-300 text-gray-700 hover:border-black hover:bg-gray-50'
            }
          `}
        >
          One Size
        </button>
      </div>
    </div>
  );
};

