import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * Pipe that skips validation for multipart/form-data requests
 * This is needed because ValidationPipe doesn't handle form-data properly
 */
@Injectable()
export class SkipMultipartValidationPipe implements PipeTransform {
  transform<T>(value: T, metadata: ArgumentMetadata): T {
    // If this is a body parameter and the request is multipart, skip validation
    if (metadata.type === 'body' && metadata.metatype) {
      interface RequestLike {
        headers?: { 'content-type'?: string };
      }
      const request = metadata.data as RequestLike | undefined;
      if (request && request.headers && request.headers['content-type']?.includes('multipart/form-data')) {
        // Return value as-is without validation
        return value;
      }
    }
    return value;
  }
}


