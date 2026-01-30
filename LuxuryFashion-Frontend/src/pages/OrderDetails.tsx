import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { getOrder, createReview, getDishReviews, cancelOrder, canCancelOrder } from "@/lib/api";
import { Package, MapPin, Phone, Calendar, ArrowLeft, CheckCircle, Clock, Truck, ChefHat, XCircle, Gift, Star, MessageSquare, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface OrderItem {
  dish?: string;
  name: string;
  price: number;
  quantity: number;
  isFree?: boolean;
}

interface Order {
  _id?: string;
  id?: string;
  items: OrderItem[];
  subtotal?: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
  totalPrice?: number;
  status: string;
  orderType: "delivery" | "takeaway";
  address?: any;
  createdAt?: string;
  paymentStatus?: string;
}

// Backend status values: placed, preparing, ready_for_pickup, out_for_delivery, delivered, cancelled
const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
  placed: { label: "Order Placed", icon: Clock, color: "text-blue-600" },
  preparing: { label: "Preparing", icon: ChefHat, color: "text-orange-600" },
  ready_for_pickup: { label: "Ready for Pickup", icon: Package, color: "text-blue-600" },
  out_for_delivery: { label: "Out for Delivery", icon: Truck, color: "text-purple-600" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-green-600" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-600" },
};

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const isLoadingRef = useRef(false);
  const [reviewingItem, setReviewingItem] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedDishes, setReviewedDishes] = useState<Set<string>>(new Set());

  // Cancellation state
  const [canCancel, setCanCancel] = useState(false);
  const [cancelTimeRemaining, setCancelTimeRemaining] = useState(0);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadOrder = useCallback(async (showLoading = true) => {
    if (!id || isLoadingRef.current) return;
    try {
      isLoadingRef.current = true;
      if (showLoading) setLoading(true);
      const data = await getOrder(id);
      setOrder(data);
    } catch (err: any) {
      console.error("Failed to load order:", err);
      if (showLoading) navigate("/orders");
    } finally {
      isLoadingRef.current = false;
      if (showLoading) setLoading(false);
    }
  }, [id, navigate]);

  // Initial load
  useEffect(() => {
    loadOrder(true);
  }, [loadOrder]);

  // Poll for updates on active orders
  useEffect(() => {
    if (!order) return;
    const isActiveOrder = !['delivered', 'cancelled'].includes(order.status?.toLowerCase() || '');
    if (!isActiveOrder) return;

    const interval = setInterval(() => {
      loadOrder(false); // Silent refresh
    }, 10000);

    return () => clearInterval(interval);
  }, [order?.status, loadOrder]);

  // Check which dishes have already been reviewed
  useEffect(() => {
    const checkReviewed = async () => {
      if (!order || order.status !== 'delivered') return;

      const reviewed = new Set<string>();
      for (const item of order.items) {
        if (item.dish) {
          try {
            const reviews = await getDishReviews(item.dish);
            // Check if current user has reviewed this dish (handled by backend)
            if (Array.isArray(reviews) && reviews.length > 0) {
              // For now, we'll just show the review button for all items
              // The backend will handle duplicate prevention
            }
          } catch (err) {
            // Ignore errors
          }
        }
      }
      setReviewedDishes(reviewed);
    };
    checkReviewed();
  }, [order]);

  // Check if order can be cancelled and start countdown
  useEffect(() => {
    if (!order || !id) return;

    const checkCancellation = async () => {
      try {
        const result = await canCancelOrder(id);
        setCanCancel(result.canCancel);
        setCancelTimeRemaining(result.timeRemaining || 0);
      } catch (err) {
        setCanCancel(false);
        setCancelTimeRemaining(0);
      }
    };

    checkCancellation();

    // Set up countdown interval - only if there's time remaining
    if (cancelTimeRemaining <= 0) return;

    const interval = setInterval(() => {
      setCancelTimeRemaining((prev) => {
        if (prev <= 1000) {
          setCanCancel(false);
          clearInterval(interval); // Stop the interval when time reaches 0
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [order, id, cancelTimeRemaining]);

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!id) return;
    setIsCancelling(true);
    try {
      await cancelOrder(id);
      toast.success("Order cancelled successfully");
      setShowCancelConfirm(false);
      setCanCancel(false);
      // Reload order to get updated status
      loadOrder(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setIsCancelling(false);
    }
  };

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSubmitReview = async (dishId: string) => {
    if (!dishId) return;
    setSubmittingReview(true);
    try {
      await createReview(dishId, reviewForm);
      toast.success("Thank you for your review!");
      setReviewedDishes((prev) => new Set([...prev, dishId]));
      setReviewingItem(null);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err: any) {
      if (err.message?.includes("already reviewed")) {
        toast.info("You've already reviewed this dish");
        setReviewedDishes((prev) => new Set([...prev, dishId]));
        setReviewingItem(null);
      } else {
        toast.error(err.message || "Failed to submit review");
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading order details...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="container mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Link to="/orders" className="btn-primary mt-4 inline-block">
          Back to Orders
        </Link>
      </main>
    );
  }

  const statusInfo = statusConfig[order.status] || statusConfig.placed;
  const StatusIcon = statusInfo.icon;
  const total = order.totalAmount || order.totalPrice || 0;
  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = order.discountAmount || 0;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/orders" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Order Details</h1>
            <p className="text-muted-foreground">Order ID: {order.id || order._id}</p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-card rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <StatusIcon className={`w-8 h-8 ${statusInfo.color}`} />
              <div>
                <h2 className="text-lg font-semibold text-foreground">{statusInfo.label}</h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {order.orderType} • {order.paymentStatus || "Payment Pending"}
                </p>
              </div>
            </div>

            {/* Cancel Button with Countdown */}
            {canCancel && cancelTimeRemaining > 0 && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 rounded-xl transition-all border border-red-200 dark:border-red-800"
              >
                <XCircle className="w-4 h-4" />
                <span className="font-medium text-sm">Cancel Order</span>
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 text-xs font-bold rounded-full tabular-nums">
                  {formatTimeRemaining(cancelTimeRemaining)}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-card rounded-2xl border border-border p-6 max-w-md w-full shadow-2xl animate-scale-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Cancel Order?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Are you sure you want to cancel this order? This action cannot be undone.
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg mb-4">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Time remaining to cancel: <span className="font-bold tabular-nums">{formatTimeRemaining(cancelTimeRemaining)}</span>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelOrder}
                      disabled={isCancelling}
                      className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      {isCancelling ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Cancelling...
                        </span>
                      ) : (
                        "Yes, Cancel Order"
                      )}
                    </button>
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      disabled={isCancelling}
                      className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-medium rounded-xl transition-colors"
                    >
                      Keep Order
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="p-1 rounded-lg hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Review Prompt for Delivered Orders */}
        {order.status === 'delivered' && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">How was your order?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your feedback helps us improve and helps other customers make better choices.
                </p>
                <div className="space-y-3">
                  {order.items.filter(item => item.dish && !item.isFree).map((item, idx) => {
                    const isReviewing = reviewingItem === item.dish;
                    const isReviewed = reviewedDishes.has(item.dish!);

                    return (
                      <div key={idx} className="bg-white dark:bg-card rounded-xl p-4 border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-foreground">{item.name}</p>
                          {isReviewed ? (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Reviewed
                            </span>
                          ) : !isReviewing ? (
                            <button
                              onClick={() => {
                                setReviewingItem(item.dish!);
                                setReviewForm({ rating: 5, comment: "" });
                              }}
                              className="px-3 py-1.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                            >
                              Write Review
                            </button>
                          ) : null}
                        </div>

                        {isReviewing && (
                          <div className="mt-3 pt-3 border-t border-border space-y-3 animate-fade-in">
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-2">Rating</label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((r) => (
                                  <button
                                    key={r}
                                    onClick={() => setReviewForm({ ...reviewForm, rating: r })}
                                    className="p-0.5 transition-transform hover:scale-110"
                                  >
                                    <Star
                                      className={cn(
                                        "w-6 h-6 transition-colors",
                                        r <= reviewForm.rating
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-muted-foreground/30"
                                      )}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-muted-foreground mb-2">Comment (optional)</label>
                              <textarea
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                className="w-full px-3 py-2 bg-secondary border-0 rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none"
                                rows={2}
                                placeholder="Share your experience..."
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSubmitReview(item.dish!)}
                                disabled={submittingReview}
                                className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
                              >
                                {submittingReview ? "Submitting..." : "Submit"}
                              </button>
                              <button
                                onClick={() => setReviewingItem(null)}
                                className="px-4 py-2 bg-secondary text-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${item.isFree ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-secondary/50'}`}>
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {item.isFree && <Gift className="w-4 h-4 text-green-600" />}
                      {item.name}
                      {item.isFree && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">FREE</span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} {!item.isFree && `× ₹${item.price}`}
                    </p>
                  </div>
                  <p className={`font-semibold ${item.isFree ? 'text-green-600' : 'text-foreground'}`}>
                    {item.isFree ? 'FREE' : `₹${(item.price * item.quantity).toFixed(2)}`}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="mt-6 pt-6 border-t border-border space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="space-y-6">
            {/* Address */}
            {order.address && (
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </h2>
                <div className="space-y-2 text-muted-foreground">
                  <p className="font-medium text-foreground">{order.address.street}</p>
                  <p>
                    {order.address.city}, {order.address.state} {order.address.zipCode}
                  </p>
                  <p>{order.address.country || "India"}</p>
                  {order.address.phoneNumber && (
                    <p className="flex items-center gap-2 mt-3">
                      <Phone className="w-4 h-4" />
                      {order.address.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Info */}
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Order Information
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Date</span>
                  <span className="text-foreground">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-IN")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Type</span>
                  <span className="text-foreground capitalize">{order.orderType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="text-foreground capitalize">{order.paymentStatus || "Pending"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderDetails;






