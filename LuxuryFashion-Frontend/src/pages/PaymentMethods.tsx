import { CreditCard, Plus } from "lucide-react";

export default function PaymentMethods() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-foreground mb-8">Payment Methods</h1>
      
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="text-center py-16">
          <CreditCard className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No payment methods saved</p>
          <p className="text-sm text-muted-foreground mb-6">
            Payment methods are handled securely during checkout
          </p>
          <button className="btn-primary flex items-center gap-2 mx-auto">
            <Plus className="w-4 h-4" />
            Add Payment Method
          </button>
        </div>
      </div>
    </main>
  );
}






