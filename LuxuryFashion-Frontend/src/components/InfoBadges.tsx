import { ChefHat, Leaf, Shield, Zap } from "lucide-react";

export function InfoBadges() {
  const badges = [
    {
      icon: ChefHat,
      label: "Freshly Cooked",
      color: "text-primary",
    },
    {
      icon: Leaf,
      label: "100% Veg",
      color: "text-green-600",
    },
    {
      icon: Shield,
      label: "Hygienic Kitchen",
      color: "text-blue-600",
    },
    {
      icon: Zap,
      label: "Fast Delivery",
      color: "text-amber-600",
    },
  ];

  return (
    <div className="bg-sage-light/30 border-y border-border">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-center gap-6 md:gap-12 flex-wrap">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm md:text-base"
            >
              <badge.icon className={`w-5 h-5 md:w-6 md:h-6 ${badge.color}`} />
              <span className="font-medium text-foreground">{badge.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


