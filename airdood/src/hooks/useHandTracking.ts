import { Hands, Results } from '@mediapipe/hands';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useHandTracking = (
  onResults: (results: Results) => void,
  enabled: boolean = false,
  cameraOn: boolean = true
) => {
  const onResultsRef = useRef(onResults);
  const videoRef = useRef<HTMLVideoElement>(null);
  const handsRef = useRef<Hands | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isLoadedRef = useRef(false);

  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const activeRef = useRef(false);
  const initializingRef = useRef(false);

  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  // Toggle camera visibility WITHOUT disabling the track (so AI keep tracking)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.style.opacity = cameraOn ? '0.6' : '0';
      videoRef.current.style.visibility = cameraOn ? 'visible' : 'hidden';
    }
  }, [cameraOn]);

  const cleanup = useCallback(() => {
    activeRef.current = false;
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (handsRef.current) {
      handsRef.current.close();
      handsRef.current = null;
    }
  }, []);

  const init = useCallback(async () => {
    if (!videoRef.current || initializingRef.current) return;

    initializingRef.current = true;
    setError(null);
    setLoadingMessage('Loading Vision Engine...');
    isLoadedRef.current = false;
    setIsLoaded(false);

    try {
      // 1. Initialize Hands Model if not already there
      if (!handsRef.current) {
        setLoadingMessage('Fetching AI Models...');
        const hands = new Hands({
            locateFile: (file) =>
              `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`,
        });
        
        hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7,
        });

        hands.onResults((results) => {
            if (!activeRef.current) return;
            onResultsRef.current(results);
        });
        handsRef.current = hands;
      }

      // 2. Request Camera
      setLoadingMessage('Requesting Camera Access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      streamRef.current = stream;

      // 3. Setup Video 
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(e => console.warn("Video play interrupted", e));
      }

      activeRef.current = true;
      
      const processFrame = async () => {
        if (!activeRef.current || !handsRef.current || !videoRef.current) return;

        if (videoRef.current.readyState >= 2) {
          try {
            await handsRef.current.send({ image: videoRef.current });
          } catch (e) {
            console.warn('Hand processing error:', e);
          }
        }
        animationFrameRef.current = requestAnimationFrame(processFrame);
      };

      processFrame();
      
      // Mark as loaded once the stream is active and loop started
      setIsLoaded(true);
      isLoadedRef.current = true;
    } catch (err: any) {
      console.error('Hand Tracking Init Failed:', err);
      if (err.name === 'NotAllowedError' || err.message?.toLowerCase().includes('permission denied')) {
        setError('Camera blocked. Open browser settings (lock icon in URL bar) to allow camera access.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No webcam found. Please connect a camera and refresh the page.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera busy. Another application is using your webcam.');
      } else {
        setError(`Vision Engine Error: ${err.message || 'Check camera permissions.'}`);
      }
    } finally {
      initializingRef.current = false;
    }
  }, [cameraOn]);

  useEffect(() => {
    if (enabled) {
      init();
    } else {
      cleanup();
    }
    return () => {
      cleanup();
    };
  }, [enabled, init]);

  return { videoRef, isLoaded, loadingMessage, error, retry: init };
};