import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Image,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Upload,
  AlertCircle,
} from "lucide-react";
import {
  fetchAdminBanners,
  fetchBannerLimit,
  uploadBanner,
  toggleBannerActive,
  deleteBanner,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { compressImageForUpload } from "@/lib/imageUtils";
import { toast } from "sonner";

interface Banner {
  _id: string;
  imageUrl: string;
  title?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

interface BannerLimit {
  current: number;
  max: number;
  remaining: number;
  canAdd: boolean;
}

const AdminBanners = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressingImage, setCompressingImage] = useState(false);

  // Upload form state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: banners = [], isLoading: loading } = useQuery({
    queryKey: ['adminBanners'],
    queryFn: async () => {
      const res = await fetchAdminBanners();
      return Array.isArray(res) ? res : [];
    },
    staleTime: 60_000,
  });

  const { data: limitInfo = null } = useQuery({
    queryKey: ['bannerLimit'],
    queryFn: () => fetchBannerLimit(),
    staleTime: 60_000,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompressingImage(true);
      try {
        // Automatically compress image to under 4MB
        const compressedFile = await compressImageForUpload(file);
        setUploadFile(compressedFile);
        setUploadPreview(URL.createObjectURL(compressedFile));
        if (file.size > 4 * 1024 * 1024) {
          toast.success(`Image compressed from ${(file.size / 1024 / 1024).toFixed(2)}MB to ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
        }
      } catch (error) {
        console.error("Image compression failed:", error);
        toast.error("Failed to process image. Please try a different image.");
      } finally {
        setCompressingImage(false);
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      
      return;
    }

    if (!limitInfo?.canAdd) {
      
      return;
    }

    setUploading(true);
    setUploadProgress(30);

    try {
      await uploadBanner(uploadFile, uploadTitle);
      setUploadProgress(100);
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadTitle("");
      setUploadPreview(null);
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      queryClient.invalidateQueries({ queryKey: ['bannerLimit'] });
    } catch (err: any) {
      
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await toggleBannerActive(id);
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
    } catch (err: any) {
      console.error("Failed to toggle banner:", err);
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBanner(id);
      setDeleteConfirm(null);
      queryClient.invalidateQueries({ queryKey: ['adminBanners'] });
      queryClient.invalidateQueries({ queryKey: ['bannerLimit'] });
    } catch (err: any) {
      console.error("Failed to delete banner:", err);
    }
  };

  const activeBanners = banners.filter((b) => b.isActive);
  const inactiveBanners = banners.filter((b) => !b.isActive);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            Banner Management
          </h2>
          <p className="text-muted-foreground">
            Manage homepage carousel banners
          </p>
        </div>

        {/* Limit indicator & Add button */}
        <div className="flex items-center gap-4">
          {limitInfo && (
            <div className="flex items-center gap-2 text-sm">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full",
                  limitInfo.canAdd
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                )}
              >
                <Image className="w-4 h-4" />
                <span className="font-medium">
                  {limitInfo.current}/{limitInfo.max} Banners
                </span>
              </div>
            </div>
          )}

          <Button
            onClick={() => setShowUploadDialog(true)}
            disabled={!limitInfo?.canAdd}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </Button>
        </div>
      </div>

      {/* Limit warning */}
      {limitInfo && !limitInfo.canAdd && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            You've reached the maximum of {limitInfo.max} banners. Delete an
            existing banner to add a new one.
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Image className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No banners yet
          </h3>
          <p className="text-muted-foreground mb-4">
            Upload your first banner to display on the homepage carousel.
          </p>
          <Button onClick={() => setShowUploadDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Banner
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Banners */}
          {activeBanners.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-600" />
                Active Banners ({activeBanners.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeBanners.map((banner) => (
                  <BannerCard
                    key={banner._id}
                    banner={banner}
                    onToggle={() => handleToggleActive(banner._id)}
                    onDelete={() => setDeleteConfirm(banner._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Inactive Banners */}
          {inactiveBanners.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <EyeOff className="w-5 h-5 text-gray-400" />
                Inactive Banners ({inactiveBanners.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inactiveBanners.map((banner) => (
                  <BannerCard
                    key={banner._id}
                    banner={banner}
                    onToggle={() => handleToggleActive(banner._id)}
                    onDelete={() => setDeleteConfirm(banner._id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload New Banner</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* File upload area */}
            <div
              className={cn(
                "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
                uploadPreview
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => document.getElementById("banner-upload")?.click()}
            >
              {uploadPreview ? (
                <div className="space-y-3">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    Click to change image
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, WebP - Auto-compressed to 4MB
                  </p>
                </div>
              )}
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Title input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Title (optional)
              </label>
              <input
                type="text"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="e.g., Summer Special Offer"
                className="input-styled w-full"
              />
            </div>

            {/* Compression progress */}
            {compressingImage && (
              <div className="space-y-2">
                <Progress value={50} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Compressing image...
                </p>
              </div>
            )}
            {/* Upload progress */}
            {uploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Uploading...
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setShowUploadDialog(false);
                setUploadFile(null);
                setUploadTitle("");
                setUploadPreview(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!uploadFile || uploading}>
              {uploading ? "Uploading..." : "Upload Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Banner</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this banner? This action cannot be
            undone.
          </p>
          <DialogFooter className="mt-4">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Banner Card Component
const BannerCard = ({
  banner,
  onToggle,
  onDelete,
}: {
  banner: Banner;
  onToggle: () => void;
  onDelete: () => void;
}) => {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border overflow-hidden transition-all",
        banner.isActive ? "border-emerald-200" : "border-border opacity-75"
      )}
    >
      {/* Image */}
      <div className="relative aspect-[16/7] overflow-hidden">
        <img
          src={banner.imageUrl}
          alt={banner.title || "Banner"}
          className="w-full h-full object-cover"
        />
        {/* Status badge */}
        <div
          className={cn(
            "absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium",
            banner.isActive
              ? "bg-emerald-500 text-white"
              : "bg-gray-500 text-white"
          )}
        >
          {banner.isActive ? "Active" : "Inactive"}
        </div>
        {/* Drag handle */}
        <div className="absolute top-3 right-3 p-1.5 bg-black/50 rounded-lg cursor-grab">
          <GripVertical className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Info & Actions */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-foreground truncate">
              {banner.title || "Untitled Banner"}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Added {new Date(banner.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle button */}
            <button
              onClick={onToggle}
              className={cn(
                "p-2 rounded-lg transition-colors",
                banner.isActive
                  ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              title={banner.isActive ? "Deactivate" : "Activate"}
            >
              {banner.isActive ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>

            {/* Delete button */}
            <button
              onClick={onDelete}
              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBanners;
