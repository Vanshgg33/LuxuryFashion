import { useState } from "react";
import { cn } from "@/lib/utils";

interface PortionSelectorProps {
  hasHalfPortion: boolean;
  fullPrice: number;
  halfPrice?: number;
  onPortionChange: (isHalf: boolean, price: number) => void;
  className?: string;
}

export function PortionSelector({ 
  hasHalfPortion, 
  fullPrice, 
  halfPrice, 
  onPortionChange,
  className 
}: PortionSelectorProps) {
  const [selectedPortion, setSelectedPortion] = useState<'full' | 'half'>('full');

  if (!hasHalfPortion || !halfPrice) {
    return null;
  }

  const handlePortionSelect = (e: React.MouseEvent, portion: 'full' | 'half') => {
    // Prevent click from propagating to parent Link
    e.preventDefault();
    e.stopPropagation();

    setSelectedPortion(portion);
    const isHalf = portion === 'half';
    const price = isHalf ? halfPrice : fullPrice;
    onPortionChange(isHalf, price);
  };

  return (
    <div
      className={cn("flex gap-1 mb-2", className)}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => handlePortionSelect(e, 'full')}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          "flex-1 px-2 py-1 text-xs rounded border transition-colors",
          selectedPortion === 'full'
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground border-border hover:border-primary/50"
        )}
      >
        Full ₹{fullPrice}
      </button>
      <button
        type="button"
        onClick={(e) => handlePortionSelect(e, 'half')}
        onMouseDown={(e) => e.stopPropagation()}
        className={cn(
          "flex-1 px-2 py-1 text-xs rounded border transition-colors",
          selectedPortion === 'half'
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-background text-muted-foreground border-border hover:border-primary/50"
        )}
      >
        Half ₹{halfPrice}
      </button>
    </div>
  );
}