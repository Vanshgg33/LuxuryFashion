import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private configured = false;

  private configureCloudinary() {
    if (this.configured) return;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();

    // Debug logging to help identify configuration issues
    this.logger.debug(`Cloudinary config check - CLOUDINARY_CLOUD_NAME: ${cloudName || 'not set'}, CLOUDINARY_URL: ${cloudinaryUrl ? 'set' : 'not set'}`);

    // Priority 1: Use CLOUDINARY_URL if explicitly set
    if (cloudinaryUrl && !cloudinaryUrl.includes('<')) {
      try {
        // Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
        const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
        
        if (urlMatch) {
          const [, parsedApiKey, parsedApiSecret, parsedCloudName] = urlMatch;
          
          // Warn if cloud_name looks incorrect
          if (parsedCloudName.includes('dduwmuhmo')) {
            this.logger.warn(`⚠️  WARNING: Cloud name appears to have a typo: "${parsedCloudName}". Should it be "dduwnuhmo" (with 'n')?`);
          }
          
          cloudinary.config({
            cloud_name: parsedCloudName,
            api_key: parsedApiKey,
            api_secret: parsedApiSecret,
          });
          this.logger.log(`Cloudinary configured via CLOUDINARY_URL (parsed) - cloud_name: ${parsedCloudName}`);
          this.configured = true;
          return;
        } else {
          // Try SDK auto-detection
          cloudinary.config();
          const config = cloudinary.config();
          if (config.cloud_name && config.api_key && config.api_secret) {
            this.logger.log('Cloudinary configured via CLOUDINARY_URL (auto-detect)');
            this.configured = true;
            return;
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to parse CLOUDINARY_URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Priority 2: Construct CLOUDINARY_URL from individual variables if all are present
    if (cloudName && apiKey && apiSecret) {
      // Warn if cloud_name looks incorrect
      if (cloudName.includes('dduwmuhmo')) {
        this.logger.warn(`⚠️  WARNING: Cloud name appears to have a typo: "${cloudName}". Should it be "dduwnuhmo" (with 'n')?`);
      }
      
      // Construct the URL format: cloudinary://api_key:api_secret@cloud_name
      const constructedUrl = `cloudinary://${apiKey}:${apiSecret}@${cloudName}`;
      
      try {
        // Set it in environment for SDK auto-detection
        process.env.CLOUDINARY_URL = constructedUrl;
        
        // Configure using the constructed URL
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });
        this.logger.log(`Cloudinary configured via individual variables - cloud_name: ${cloudName}, api_key: ${apiKey.substring(0, 4)}***`);
        this.configured = true;
        return;
      } catch (error) {
        this.logger.error(`Failed to configure Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
        this.configured = true; // Set to true to prevent repeated attempts
        return;
      }
    }

    // No valid configuration found
    this.logger.error(
      'Cloudinary credentials not configured. Image uploads will fail. ' +
      'Please set CLOUDINARY_URL or provide CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET'
    );
    this.configured = true; // Set to true to prevent repeated log spam
  }

  async uploadBuffer(file: Express.Multer.File, folder = 'rangeeladhaba'): Promise<UploadApiResponse> {
    this.configureCloudinary();

    // Validate file
    if (!file || !file.buffer) {
      throw new Error('Invalid file: buffer is required');
    }

    // Verify Cloudinary is actually configured by checking the config
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      throw new Error(
        'Cloudinary is not properly configured. Please set CLOUDINARY_URL or ' +
        'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables. ' +
        'Current config: ' + JSON.stringify({ 
          hasCloudName: !!config.cloud_name, 
          hasApiKey: !!config.api_key, 
          hasApiSecret: !!config.api_secret 
        })
      );
    }

    // Log configuration (without exposing secrets)
    this.logger.debug(`Cloudinary config - cloud_name: ${config.cloud_name}, api_key: ${config.api_key?.substring(0, 4)}***`);

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { 
          folder, 
          resource_type: 'auto',
          // Optional: Add transformation settings
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (err, result) => {
          if (err) {
            this.logger.error('Cloudinary upload error:', err);
            
            // Provide helpful error messages based on error type
            let errorMessage = `Cloudinary upload failed: ${err.message}`;
            if (err.http_code === 401) {
              if (err.message?.includes('cloud_name')) {
                errorMessage = `Invalid Cloudinary cloud_name. Please verify CLOUDINARY_CLOUD_NAME in your .env file matches your Cloudinary account. Current: ${config.cloud_name}`;
              } else {
                errorMessage = `Invalid Cloudinary credentials (401 Unauthorized). Please verify your CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET match your cloud_name: ${config.cloud_name}`;
              }
            }
            
            return reject(new Error(errorMessage));
          }
          if (!result) {
            return reject(new Error('No result from Cloudinary upload'));
          }
          this.logger.log(`Successfully uploaded file to Cloudinary: ${result.secure_url}`);
          resolve(result);
        }
      );
      Readable.from(file.buffer).pipe(upload);
    });
  }
}
