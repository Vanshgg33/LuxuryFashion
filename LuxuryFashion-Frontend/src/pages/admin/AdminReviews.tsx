import { useState, useEffect } from "react";
import { getAdminReviews, toggleReviewVisibility, adminDeleteReview } from "@/lib/api";
import { Star, Eye, EyeOff, Trash2, Search, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVisibility, setFilterVisibility] = useState<"all" | "visible" | "hidden">("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getAdminReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load reviews:", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (reviewId: string) => {
    setTogglingId(reviewId);
    try {
      const updated = await toggleReviewVisibility(reviewId);
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, isVisible: updated.isVisible } : r))
      );
      toast.success(updated.isVisible ? "Review is now visible" : "Review is now hidden");
    } catch (err: any) {
      console.error("Failed to toggle visibility:", err);
      toast.error("Failed to update review");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;

    setDeletingId(reviewId);
    try {
      await adminDeleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
      toast.success("Review deleted successfully");
    } catch (err: any) {
      console.error("Failed to delete review:", err);
      toast.error("Failed to delete review");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    // Filter by visibility
    if (filterVisibility === "visible" && !review.isVisible) return false;
    if (filterVisibility === "hidden" && review.isVisible) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        review.user?.name?.toLowerCase().includes(query) ||
        review.user?.email?.toLowerCase().includes(query) ||
        review.dish?.name?.toLowerCase().includes(query) ||
        review.comment?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    total: reviews.length,
    visible: reviews.filter((r) => r.isVisible).length,
    hidden: reviews.filter((r) => !r.isVisible).length,
    avgRating: reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-shimmer rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-shimmer rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-muted animate-shimmer rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Review Moderation</h1>
        <button
          onClick={loadReviews}
          className="px-4 py-2 text-sm bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total Reviews</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Visible</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.visible}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Hidden</p>
          <p className="text-2xl font-bold text-red-600">{stats.hidden}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Avg. Rating</p>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <p className="text-2xl font-bold text-foreground">{stats.avgRating}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user, dish, or comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-styled w-full pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-secondary rounded"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(["all", "visible", "hidden"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setFilterVisibility(filter)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize",
                filterVisibility === filter
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No reviews match your search" : "No reviews yet"}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review._id}
              className={cn(
                "bg-card rounded-xl border p-4 transition-all",
                review.isVisible ? "border-border" : "border-red-200 bg-red-50/50 dark:bg-red-950/10"
              )}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Dish Image */}
                {review.dish?.imageUrl && (
                  <img
                    src={review.dish.imageUrl}
                    alt={review.dish.name}
                    className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-lg flex-shrink-0"
                  />
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-foreground">
                        {review.user?.name || "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">{review.user?.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                      {!review.isVisible && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-1">
                    on <span className="font-medium text-foreground">{review.dish?.name || "Unknown Dish"}</span>
                  </p>

                  {review.comment && (
                    <p className="text-foreground text-sm mt-2">{review.comment}</p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-muted-foreground">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Unknown date"}
                    </p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleVisibility(review._id)}
                        disabled={togglingId === review._id}
                        className={cn(
                          "p-2 rounded-lg transition-colors disabled:opacity-50",
                          review.isVisible
                            ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                        title={review.isVisible ? "Hide review" : "Show review"}
                      >
                        {review.isVisible ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        disabled={deletingId === review._id}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                        title="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
