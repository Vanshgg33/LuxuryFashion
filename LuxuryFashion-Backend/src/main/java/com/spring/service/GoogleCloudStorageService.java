package com.spring.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class GoogleCloudStorageService {

    private final Storage storage;
    private final String bucketName;
    private final boolean gcsEnabled;

    public GoogleCloudStorageService(@Value("${gcs.bucket.name}") String bucketName,
                                     @Value("${gcs.project.id}") String projectId) {
        this.bucketName = bucketName;
        Storage tempStorage = null;
        boolean enabled = false;
        
        try {
            // Initialize GCS client
            // This will use default credentials if GOOGLE_APPLICATION_CREDENTIALS is set
            // Or use service account credentials from the environment
            tempStorage = StorageOptions.newBuilder()
                    .setProjectId(projectId)
                    .build()
                    .getService();
            enabled = true;
            System.out.println("Google Cloud Storage initialized successfully for bucket: " + bucketName);
        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("WARNING: Failed to initialize Google Cloud Storage");
            System.err.println("Error: " + e.getMessage());
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("========================================");
            System.err.println("Please ensure:");
            System.err.println("1. GOOGLE_APPLICATION_CREDENTIALS environment variable is set");
            System.err.println("2. Path points to valid service account JSON file");
            System.err.println("3. Service account has Storage Object Creator or Storage Admin role");
            System.err.println("4. Bucket name is correct: " + bucketName);
            System.err.println("========================================");
            e.printStackTrace();
            System.err.println("========================================");
        }
        
        this.storage = tempStorage;
        this.gcsEnabled = enabled;
    }

    /**
     * Upload a file to Google Cloud Storage
     * @param file The file to upload
     * @param folder The folder path in the bucket (e.g., "products", "profiles", "gallery")
     * @return The public URL of the uploaded file
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        if (!gcsEnabled || storage == null) {
            throw new IOException("Google Cloud Storage is not properly configured. Please set GOOGLE_APPLICATION_CREDENTIALS environment variable.");
        }

        try {
            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            } else {
                extension = ".jpg"; // Default extension
            }

            String fileName = folder + "/" + UUID.randomUUID().toString() + "_" + System.currentTimeMillis() + extension;

            // Upload to GCS
            BlobId blobId = BlobId.of(bucketName, fileName);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType(file.getContentType())
                    .build();

            storage.create(blobInfo, file.getBytes());

            // Return public URL (bucket must be configured for public access)
            // Format: https://storage.googleapis.com/bucket-name/path/to/file
            return String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);
        } catch (com.google.cloud.storage.StorageException e) {
            System.err.println("========================================");
            System.err.println("GCS StorageException during upload");
            System.err.println("Error Code: " + e.getCode());
            System.err.println("Error Message: " + e.getMessage());
            System.err.println("Bucket: " + bucketName);
            System.err.println("========================================");
            
            if (e.getCode() == 403) {
                String errorMsg = "Permission denied: Service account does not have write access to bucket '" + bucketName + "'. " +
                        "Please grant 'Storage Object Creator' or 'Storage Admin' role to your service account.";
                System.err.println(errorMsg);
                throw new IOException(errorMsg, e);
            } else if (e.getCode() == 404) {
                String errorMsg = "Bucket not found: '" + bucketName + "'. Please check the bucket name in application.properties.";
                System.err.println(errorMsg);
                throw new IOException(errorMsg, e);
            } else {
                String errorMsg = "Google Cloud Storage error (" + e.getCode() + "): " + e.getMessage();
                System.err.println(errorMsg);
                throw new IOException(errorMsg, e);
            }
        } catch (Exception e) {
            System.err.println("========================================");
            System.err.println("Unexpected error during GCS upload");
            System.err.println("Error: " + e.getMessage());
            System.err.println("Error Type: " + e.getClass().getName());
            System.err.println("========================================");
            e.printStackTrace();
            throw new IOException("Failed to upload file to Google Cloud Storage: " + e.getMessage(), e);
        }
    }

    /**
     * Upload a file to Google Cloud Storage with custom filename
     * @param file The file to upload
     * @param folder The folder path in the bucket
     * @param customFileName The custom filename to use
     * @return The public URL of the uploaded file
     */
    public String uploadFileWithName(MultipartFile file, String folder, String customFileName) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        String fileName = folder + "/" + customFileName;

        // Upload to GCS
        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        // Return public URL (bucket must be configured for public access)
        // Format: https://storage.googleapis.com/bucket-name/path/to/file
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);
    }

    /**
     * Delete a file from Google Cloud Storage
     * @param fileUrl The public URL of the file to delete
     * @return true if deleted successfully, false otherwise
     */
    public boolean deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }

        if (!gcsEnabled || storage == null) {
            System.err.println("Google Cloud Storage is not properly configured. Cannot delete file: " + fileUrl);
            return false;
        }

        try {
            // Extract blob name from URL
            // GCS URLs format: https://storage.googleapis.com/bucket-name/path/to/file
            String blobName = extractBlobNameFromUrl(fileUrl);
            if (blobName == null) {
                return false;
            }

            BlobId blobId = BlobId.of(bucketName, blobName);
            return storage.delete(blobId);
        } catch (Exception e) {
            System.err.println("Failed to delete file from GCS: " + e.getMessage());
            return false;
        }
    }

    /**
     * Extract blob name from GCS URL
     * @param url The GCS public URL
     * @return The blob name (path in bucket)
     */
    private String extractBlobNameFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }

        // Handle different URL formats
        // Format 1: https://storage.googleapis.com/bucket-name/path/to/file
        // Format 2: https://storage.cloud.google.com/bucket-name/path/to/file
        // Format 3: gs://bucket-name/path/to/file
        
        if (url.startsWith("gs://")) {
            String withoutPrefix = url.substring(5); // Remove "gs://"
            int firstSlash = withoutPrefix.indexOf("/");
            if (firstSlash > 0) {
                return withoutPrefix.substring(firstSlash + 1);
            }
        } else if (url.contains("storage.googleapis.com/") || url.contains("storage.cloud.google.com/")) {
            // Extract path after bucket name
            String[] parts = url.split(bucketName + "/");
            if (parts.length > 1) {
                return parts[1].split("\\?")[0]; // Remove query parameters if any
            }
        } else if (url.startsWith("https://") && url.contains(bucketName)) {
            // Try to extract from any https URL containing bucket name
            int bucketIndex = url.indexOf(bucketName);
            if (bucketIndex > 0) {
                String afterBucket = url.substring(bucketIndex + bucketName.length());
                if (afterBucket.startsWith("/")) {
                    String path = afterBucket.substring(1).split("\\?")[0];
                    return path;
                }
            }
        }

        // If URL is already just a path (stored in DB), return as is
        if (!url.startsWith("http") && !url.startsWith("gs://")) {
            return url;
        }

        return null;
    }

    /**
     * Get public URL for a file (if it's already stored as a path)
     * @param filePath The file path in the bucket
     * @return The public URL
     */
    public String getPublicUrl(String filePath) {
        if (filePath == null || filePath.isEmpty()) {
            return null;
        }

        // If already a full URL, return as is
        if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
            return filePath;
        }

        // Construct public URL
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, filePath);
    }
}

