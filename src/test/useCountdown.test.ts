import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown } from '../hooks/useCountdown';

describe('useCountdown Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default values and WAITING state', () => {
    const { result } = renderHook(() => useCountdown({ totalShots: 6, countdownSeconds: 3 }));

    expect(result.current.currentShot).toBe(0);
    expect(result.current.countdownValue).toBe(3);
    expect(result.current.countdownState).toBe('WAITING');
    expect(result.current.isRunning).toBe(false);
  });

  it('runs countdown ticks and triggers capture callback', () => {
    const onCapture = vi.fn();
    const { result } = renderHook(() =>
      useCountdown({ totalShots: 2, countdownSeconds: 3, onCaptureFrame: onCapture })
    );

    act(() => {
      result.current.startShootSequence();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.countdownState).toBe('COUNTING');
    expect(result.current.countdownValue).toBe(3);

    // Fast-forward 1s
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.countdownValue).toBe(2);

    // Fast-forward 2s to reach 0
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onCapture).toHaveBeenCalledWith(0);
  });
});
