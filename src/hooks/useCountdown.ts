import { useState, useRef, useCallback, useEffect } from 'react';
import type { CountdownState } from '../types/photobooth';
import { sounds } from '../utils/audio';

export interface UseCountdownProps {
  totalShots?: number;
  countdownSeconds?: number;
  delayBetweenShots?: number;
  onCaptureFrame?: (shotIndex: number) => void;
  onCompleteAllShots?: () => void;
}

export function useCountdown({
  totalShots = 6,
  countdownSeconds = 3,
  delayBetweenShots = 1500,
  onCaptureFrame,
  onCompleteAllShots,
}: UseCountdownProps) {
  const [currentShot, setCurrentShot] = useState(0); // 0-indexed
  const [countdownValue, setCountdownValue] = useState(countdownSeconds);
  const [countdownState, setCountdownState] = useState<CountdownState>('WAITING');
  const [isRunning, setIsRunning] = useState(false);
  const [flashActive, setFlashActive] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const singleShotModeRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const triggerShotCapture = useCallback(
    (shotIdx: number) => {
      // 1. Play 880Hz final beep + shutter sound
      sounds.playFinalBeep();
      sounds.playShutterSound();

      // 2. Activate white flash overlay (150ms)
      setFlashActive(true);
      setCountdownState('FLASH');

      // 3. Invoke capture callback
      if (onCaptureFrame) {
        onCaptureFrame(shotIdx);
      }

      timerRef.current = setTimeout(() => {
        setFlashActive(false);
        setCountdownState('CAPTURED');

        // Check if single shot retake mode
        if (singleShotModeRef.current !== null) {
          singleShotModeRef.current = null;
          setIsRunning(false);
          sounds.playSuccessChime();
          return;
        }

        // Check if all shots done
        if (shotIdx + 1 >= totalShots) {
          setIsRunning(false);
          sounds.playSuccessChime();
          if (onCompleteAllShots) {
            setTimeout(onCompleteAllShots, 800);
          }
        } else {
          // Pause between shots (1500ms default)
          timerRef.current = setTimeout(() => {
            setCurrentShot(shotIdx + 1);
            runSingleCountdown(shotIdx + 1);
          }, delayBetweenShots);
        }
      }, 150);
    },
    [onCaptureFrame, onCompleteAllShots, totalShots, delayBetweenShots]
  );

  const runSingleCountdown = useCallback(
    (shotIdx: number) => {
      setCountdownState('COUNTING');
      setCountdownValue(countdownSeconds);
      sounds.playCountdownBeep();

      let currentSec = countdownSeconds;

      intervalRef.current = setInterval(() => {
        currentSec -= 1;
        if (currentSec > 0) {
          setCountdownValue(currentSec);
          sounds.playCountdownBeep();
        } else {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setCountdownValue(0);
          triggerShotCapture(shotIdx);
        }
      }, 1000);
    },
    [countdownSeconds, triggerShotCapture]
  );

  const startShootSequence = useCallback(() => {
    clearTimers();
    singleShotModeRef.current = null;
    setCurrentShot(0);
    setIsRunning(true);
    runSingleCountdown(0);
  }, [clearTimers, runSingleCountdown]);

  const retakeSingleShot = useCallback(
    (shotIdx: number) => {
      clearTimers();
      singleShotModeRef.current = shotIdx;
      setCurrentShot(shotIdx);
      setIsRunning(true);
      runSingleCountdown(shotIdx);
    },
    [clearTimers, runSingleCountdown]
  );

  const stopShootSequence = useCallback(() => {
    clearTimers();
    setIsRunning(false);
    setCountdownState('WAITING');
    setFlashActive(false);
    singleShotModeRef.current = null;
  }, [clearTimers]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    currentShot,
    totalShots,
    countdownValue,
    countdownState,
    isRunning,
    flashActive,
    startShootSequence,
    stopShootSequence,
    retakeSingleShot,
  };
}
