/**
 * Enhanced geolocation utility for Google Maps-level accuracy
 * Uses watchPosition with progressive accuracy improvements
 */

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  retries?: number;
  desiredAccuracy?: number; // Target accuracy in meters
  maxWaitTime?: number; // Maximum time to wait for desired accuracy
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

/**
 * Get highly accurate current position using watchPosition for progressive accuracy
 * Similar to how Google Maps gets location - waits for GPS to lock on
 */
export function getAccurateLocation(
  options: GeolocationOptions = {}
): Promise<GeolocationResult> {
  const {
    enableHighAccuracy = true,
    timeout = 30000, // 30 seconds total timeout
    maximumAge = 0, // Always get fresh location
    desiredAccuracy = 20, // Target 20 meters accuracy (Google Maps level)
    maxWaitTime = 20000, // Wait up to 20 seconds for best accuracy
  } = options;

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    let watchId: number | null = null;
    let bestResult: GeolocationResult | null = null;
    let resolved = false;
    const startTime = Date.now();

    // Cleanup function
    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };

    // Resolve with best result
    const resolveWithBest = () => {
      if (resolved) return;
      resolved = true;
      cleanup();

      if (bestResult) {
        console.log(`📍 Final location accuracy: ${bestResult.accuracy.toFixed(1)}m`);
        resolve(bestResult);
      } else {
        reject(new Error("Unable to get your location. Please try again."));
      }
    };

    // Timeout handler - resolve with best result we have
    const timeoutId = setTimeout(() => {
      console.log("⏱️ Location timeout - using best available result");
      resolveWithBest();
    }, timeout);

    // Accuracy achieved handler - resolve early if we got good accuracy
    const checkAccuracyAndResolve = (result: GeolocationResult) => {
      const elapsed = Date.now() - startTime;

      // If we achieved desired accuracy, resolve immediately
      if (result.accuracy <= desiredAccuracy) {
        console.log(`✅ Desired accuracy achieved: ${result.accuracy.toFixed(1)}m`);
        clearTimeout(timeoutId);
        resolved = true;
        cleanup();
        resolve(result);
        return;
      }

      // If we've waited long enough and have a reasonable result, resolve
      if (elapsed >= maxWaitTime && result.accuracy <= 100) {
        console.log(`⏱️ Max wait time reached, using accuracy: ${result.accuracy.toFixed(1)}m`);
        clearTimeout(timeoutId);
        resolveWithBest();
        return;
      }

      // If accuracy is acceptable (< 50m) after minimum wait, resolve
      if (elapsed >= 5000 && result.accuracy <= 50) {
        console.log(`✅ Good accuracy achieved: ${result.accuracy.toFixed(1)}m`);
        clearTimeout(timeoutId);
        resolved = true;
        cleanup();
        resolve(result);
        return;
      }
    };

    // Use watchPosition for progressive accuracy improvements
    // This is the key to Google Maps-like accuracy - it keeps refining the position
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const result: GeolocationResult = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        };

        console.log(`📍 Location update: ${result.accuracy.toFixed(1)}m accuracy`);

        // Keep track of best result (lowest accuracy value = most accurate)
        if (!bestResult || result.accuracy < bestResult.accuracy) {
          bestResult = result;
        }

        checkAccuracyAndResolve(result);
      },
      (error) => {
        cleanup();
        clearTimeout(timeoutId);

        if (resolved) return;

        // If we have any result, use it
        if (bestResult) {
          resolved = true;
          resolve(bestResult);
          return;
        }

        let errorMessage = "Unable to get your location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access denied. Please enable location permissions in your browser/device settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location unavailable. Please ensure GPS is enabled and you have a clear view of the sky.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Location request timed out. Please try again in an open area.";
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }

        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy,
        timeout: timeout,
        maximumAge,
      }
    );

    // Also try getCurrentPosition as a fallback for quick initial result
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (resolved) return;

        const result: GeolocationResult = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
        };

        if (!bestResult || result.accuracy < bestResult.accuracy) {
          bestResult = result;
        }
      },
      () => {
        // Ignore errors from getCurrentPosition, watchPosition will handle it
      },
      {
        enableHighAccuracy,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Watch position for continuous updates (useful for tracking)
 */
export function watchPosition(
  onSuccess: (result: GeolocationResult) => void,
  onError?: (error: Error) => void,
  options: GeolocationOptions = {}
): number | null {
  if (!navigator.geolocation) {
    onError?.(new Error("Geolocation is not supported by your browser"));
    return null;
  }

  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 5000, // Accept cached position up to 5 seconds old
  } = options;

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const result: GeolocationResult = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
      };
      onSuccess(result);
    },
    (error) => {
      let errorMessage = "Unable to get your location";

      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = "Location access denied";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = "Location information is unavailable";
          break;
        case error.TIMEOUT:
          errorMessage = "Location request timed out";
          break;
      }

      onError?.(new Error(errorMessage));
    },
    {
      enableHighAccuracy,
      timeout,
      maximumAge,
    }
  );

  return watchId;
}

/**
 * Stop watching position
 */
export function clearWatch(watchId: number): void {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
}


