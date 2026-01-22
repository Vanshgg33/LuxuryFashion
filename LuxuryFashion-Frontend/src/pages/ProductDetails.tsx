import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Clock,
  Flame,
  MessageSquare,
  Heart,
  Share2,
  Check,
  ChevronRight,
  Pencil,
  Trash2,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchProducts } from "@/data/foodData";
import type { FoodItem } from "@/data/foodData";
import { useCartContext } from "@/contexts/CartContext";
import { ProductCard } from "@/components/ProductCard";
import { getDishReviews, getDishRating, createReview, updateReview, deleteReview, addFavorite, removeFavorite, checkFavorite } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, cartItems } = useCartContext();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [item, setItem] = useState<FoodItem | undefined>(undefined);
  const [relatedItems, setRelatedItems] = useState<FoodItem[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState({ averageRating: 0, totalReviews: 0 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ rating: 5, comment: "" });
  const [deletingReview, setDeletingReview] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const prods = await fetchProducts();
        const found = prods.find((p) => p.id === id);
        setItem(found);
        if (found) {
          setRelatedItems(prods.filter((f) => f.category === found.category && f.id !== id).slice(0, 4));
        }
        if (id) {
          try {
            const [reviewsData, ratingData] = await Promise.all([
              getDishReviews(id).catch(() => []),
              getDishRating(id).catch(() => ({ averageRating: 0, totalReviews: 0 })),
            ]);
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            setRating(ratingData);
          } catch (err) {
            console.error("Failed to load reviews", err);
          }
        }
      } catch (err) {
        console.error("Failed to fetch product details:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  // Check favorite status
  useEffect(() => {
    if (user && id) {
      checkFavorite(id)
        .then((fav) => setIsFavorite(fav))
        .catch(() => setIsFavorite(false));
    }
  }, [user, id]);

  const handleSubmitReview = async () => {
    if (!user || !id) {
      toast.error("Please login to submit a review");
      return;
    }
    setSubmittingReview(true);
    try {
      await createReview(id, reviewForm);
      toast.success("Review submitted successfully!");
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "" });
      const [reviewsData, ratingData] = await Promise.all([
        getDishReviews(id),
        getDishRating(id),
      ]);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setRating(ratingData);
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = (review: any) => {
    setEditingReview(review._id || review.id);
    setEditForm({ rating: review.rating, comment: review.comment || "" });
  };

  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({ rating: 5, comment: "" });
  };

  const handleUpdateReview = async () => {
    if (!user || !id) return;
    setSubmittingReview(true);
    try {
      await updateReview(id, editForm);
      toast.success("Review updated successfully!");
      setEditingReview(null);
      setEditForm({ rating: 5, comment: "" });
      const [reviewsData, ratingData] = await Promise.all([
        getDishReviews(id),
        getDishRating(id),
      ]);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setRating(ratingData);
    } catch (err: any) {
      console.error("Failed to update review:", err);
      toast.error(err.message || "Failed to update review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!user || !id) return;
    if (!confirm("Are you sure you want to delete your review?")) return;

    setDeletingReview(true);
    try {
      await deleteReview(id);
      toast.success("Review deleted successfully!");
      const [reviewsData, ratingData] = await Promise.all([
        getDishReviews(id),
        getDishRating(id),
      ]);
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setRating(ratingData);
    } catch (err: any) {
      console.error("Failed to delete review:", err);
      toast.error(err.message || "Failed to delete review");
    } finally {
      setDeletingReview(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Please login to save favorites");
      return;
    }
    if (!id) return;

    setLoadingFavorite(true);
    try {
      if (isFavorite) {
        await removeFavorite(id);
        setIsFavorite(false);
        toast.success("Removed from favorites");
      } else {
        await addFavorite(id);
        setIsFavorite(true);
        toast.success("Added to favorites");
      }
    } catch (err: any) {
      console.error("Failed to toggle favorite:", err);
      toast.error(err.message || "Failed to update favorites");
    } finally {
      setLoadingFavorite(false);
    }
  };

  const cartItem = cartItems.find((c) => c.id === id);

  // Loading State
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container-wide py-8">
          <div className="h-8 w-32 bg-muted animate-shimmer rounded mb-8" />
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-muted animate-shimmer rounded-3xl" />
            <div className="space-y-6">
              <div className="h-6 w-24 bg-muted animate-shimmer rounded" />
              <div className="h-10 w-3/4 bg-muted animate-shimmer rounded" />
              <div className="h-4 w-1/2 bg-muted animate-shimmer rounded" />
              <div className="h-24 w-full bg-muted animate-shimmer rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Not Found State
  if (!item) {
    return (
      <main className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-secondary flex items-center justify-center">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            Dish not found
          </h1>
          <p className="text-muted-foreground mb-8">
            The dish you're looking for doesn't exist or may have been removed.
          </p>
          <Link
            to="/menu"
            className={cn(
              "inline-flex items-center justify-center gap-2",
              "px-8 py-4 rounded-full",
              "bg-foreground text-background",
              "font-semibold text-base",
              "transition-all duration-300",
              "hover:opacity-90 hover:shadow-large",
              "group"
            )}
          >
            Browse Menu
            <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </main>
    );
  }

  const handleAddToCart = async () => {
    if (item.inStock === false) return;
    setIsAdding(true);
    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart(item.id, 1);
      }
      setQuantity(1);
    } catch (error: any) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: item.description,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container-wide py-4">
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link to="/menu" className="text-muted-foreground hover:text-foreground transition-colors">
              Menu
            </Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">{item.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Details */}
      <div className="container-wide py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-16">
          {/* Image Section */}
          <div className="relative animate-fade-in-up">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-large">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Veg/Non-veg Badge */}
            <div className="absolute top-6 left-6">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-medium border-2",
                item.isVeg ? "border-green-500" : "border-red-500"
              )}>
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  item.isVeg ? "bg-green-500" : "bg-red-500"
                )} />
              </div>
            </div>

            {/* Special Badge */}
            {(item.isSpecial || item.isTrending) && (
              <div className="absolute top-6 right-6">
                <span className="px-4 py-2 text-sm font-semibold rounded-full bg-accent text-accent-foreground shadow-medium">
                  {item.isSpecial ? "Chef's Special" : "Trending"}
                </span>
              </div>
            )}

            {/* Out of Stock Overlay */}
            {item.inStock === false && (
              <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center">
                <span className="px-6 py-3 bg-white text-foreground font-semibold rounded-full shadow-large">
                  Currently Unavailable
                </span>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            {/* Category */}
            <span className="inline-block text-sm font-medium text-accent">
              {item.category}
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {item.name}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-full">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">{item.rating}</span>
                <span className="text-muted-foreground">({rating.totalReviews || 50}+ ratings)</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>25-30 min</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Flame className="w-4 h-4" />
                <span>{item.inStock === false ? "Out of Stock" : "Popular"}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed">
              {item.description}
            </p>

            {/* Ingredients */}
            {item.ingredients && item.ingredients.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      className="px-3 py-1.5 bg-secondary text-sm font-medium rounded-full"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-4 border-t border-border">
              <span className="text-4xl font-bold text-foreground">
                ₹{item.price}
              </span>
              <span className="text-muted-foreground">per serving</span>
            </div>

            {/* Add to Cart Section */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              {/* Quantity Stepper */}
              <div className={cn(
                "inline-flex items-center justify-center rounded-full",
                "bg-secondary border border-border/50"
              )}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 rounded-l-full hover:bg-muted transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="w-12 text-center text-lg font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 rounded-r-full hover:bg-muted transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={item.inStock === false || isAdding}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2",
                  "py-4 px-8 rounded-full",
                  "bg-foreground text-background",
                  "font-semibold text-base",
                  "transition-all duration-300",
                  "hover:opacity-90 hover:shadow-large",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "group"
                )}
              >
                {isAdding ? (
                  <div className="w-5 h-5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    {item.inStock === false ? "Out of Stock" : `Add to Cart · ₹${item.price * quantity}`}
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleFavorite}
                disabled={loadingFavorite}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full",
                  "font-medium text-sm transition-all duration-300",
                  isFavorite
                    ? "bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-900"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                {isFavorite ? "Saved" : "Save"}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Cart Status */}
            {cartItem && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span>{cartItem.quantity} item(s) already in cart</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="bg-muted/30 border-y border-border">
        <div className="container-wide py-12 md:py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-foreground" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Reviews
              </h2>
              <span className="px-3 py-1 bg-secondary text-sm font-medium rounded-full">
                {rating.totalReviews}
              </span>
            </div>
            {user && (
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className={cn(
                  "px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-300",
                  showReviewForm
                    ? "bg-secondary text-foreground"
                    : "bg-foreground text-background hover:opacity-90"
                )}
              >
                {showReviewForm ? "Cancel" : "Write Review"}
              </button>
            )}
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="card-premium p-6 md:p-8 mb-8 animate-fade-in-up">
              <h3 className="font-semibold text-lg mb-6">Write a Review</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        onClick={() => setReviewForm({ ...reviewForm, rating: r })}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star
                          className={cn(
                            "w-8 h-8 transition-colors",
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
                  <label className="block text-sm font-medium mb-3">Your Review</label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className={cn(
                      "w-full px-4 py-3",
                      "bg-secondary border-0 rounded-xl",
                      "text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring/20",
                      "resize-none"
                    )}
                    rows={4}
                    placeholder="Share your experience with this dish..."
                  />
                </div>
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className={cn(
                    "px-6 py-3 rounded-xl",
                    "bg-foreground text-background",
                    "font-semibold transition-all duration-300",
                    "hover:opacity-90 disabled:opacity-50"
                  )}
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          )}

          {/* Rating Summary */}
          {rating.averageRating > 0 && (
            <div className="card-premium p-6 md:p-8 text-center mb-8">
              <div className="text-5xl font-bold text-foreground mb-3">
                {rating.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((r) => (
                  <Star
                    key={r}
                    className={cn(
                      "w-6 h-6",
                      r <= Math.round(rating.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">Based on {rating.totalReviews} reviews</p>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              reviews.map((review: any, index: number) => {
                const isOwnReview = user && (review.user?._id === user._id || review.user?.id === user._id || review.user === user._id);
                const isEditing = editingReview === (review._id || review.id);

                return (
                  <div
                    key={review._id || review.id}
                    className="card-premium p-6 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {isEditing ? (
                      /* Edit Mode */
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">Edit Your Review</h4>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((r) => (
                              <button
                                key={r}
                                onClick={() => setEditForm({ ...editForm, rating: r })}
                                className="p-0.5 transition-transform hover:scale-110"
                              >
                                <Star
                                  className={cn(
                                    "w-6 h-6 transition-colors",
                                    r <= editForm.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-muted-foreground/30"
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Comment</label>
                          <textarea
                            value={editForm.comment}
                            onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                            className="w-full px-3 py-2 bg-secondary border-0 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 resize-none text-sm"
                            rows={3}
                            placeholder="Update your review..."
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleUpdateReview}
                            disabled={submittingReview}
                            className="px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                          >
                            {submittingReview ? "Saving..." : "Save Changes"}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-secondary text-foreground text-sm font-medium rounded-lg hover:bg-secondary/80 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                              <span className="text-sm font-semibold text-foreground">
                                {(review.user?.name || "A")[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {review.user?.name || "Anonymous"}
                                {isOwnReview && (
                                  <span className="ml-2 text-xs font-normal text-muted-foreground">(You)</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {review.createdAt
                                  ? new Date(review.createdAt).toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric"
                                    })
                                  : "Recently"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((r) => (
                                <Star
                                  key={r}
                                  className={cn(
                                    "w-4 h-4",
                                    r <= review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-muted-foreground/30"
                                  )}
                                />
                              ))}
                            </div>
                            {isOwnReview && (
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditReview(review)}
                                  className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                                  title="Edit review"
                                >
                                  <Pencil className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                </button>
                                <button
                                  onClick={handleDeleteReview}
                                  disabled={deletingReview}
                                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
                                  title="Delete review"
                                >
                                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-600" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-foreground leading-relaxed">{review.comment}</p>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Related Items */}
      {relatedItems.length > 0 && (
        <section className="container-wide py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              You May Also Like
            </h2>
            <Link
              to={`/menu?category=${item.category}`}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              View All
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedItems.map((relatedItem, index) => (
              <div
                key={relatedItem.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard item={relatedItem} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
};

export default ProductDetails;
