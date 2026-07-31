import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isReady: boolean;
  error: string | null;
  facingMode: 'user' | 'environment';
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => void;
  captureFrame: (mirrored?: boolean) => string | null;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setIsReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().then(() => setIsReady(true)).catch(() => {});
      }
    } catch (err: unknown) {
      console.error('Camera permission or access error:', err);
      let msg = 'Unable to access camera.';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          msg = 'Camera permission denied. Please allow camera access in browser settings.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          msg = 'No camera device detected on this system.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          msg = 'Camera is currently in use by another application.';
        }
      }
      setError(msg);
      setIsReady(false);
    }
  }, [facingMode]);

  // Sync stream to video element whenever videoRef or stream mounts
  useEffect(() => {
    const video = videoRef.current;
    const currentStream = streamRef.current || stream;
    if (video && currentStream && video.srcObject !== currentStream) {
      video.srcObject = currentStream;
      video.play().then(() => setIsReady(true)).catch(() => {});
    }
  }, [stream]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  /**
   * Captures current video frame into base64 DataURL string (JPEG 0.85 quality for fast socket transmission).
   */
  const captureFrame = useCallback(
    (mirrorOverride = false): string | null => {
      const video = videoRef.current;
      if (!video) {
        console.warn('captureFrame: videoRef is null');
        return null;
      }

      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;

      if (width === 0 || video.readyState < 2) {
        console.warn('captureFrame: video element not ready or zero dimensions', {
          width,
          readyState: video.readyState,
        });
        return null;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      ctx.save();

      // Mirror transform calculation
      if (facingMode === 'user' && !mirrorOverride) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      } else if (mirrorOverride) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, width, height);
      ctx.restore();

      return canvas.toDataURL('image/jpeg', 0.85);
    },
    [facingMode]
  );

  return {
    videoRef,
    stream,
    isReady,
    error,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    captureFrame,
  };
}
