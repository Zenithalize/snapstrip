import { useState, useCallback, useEffect } from 'react';
import type { FrameItem } from '../types/photobooth';

export function usePhotoStrip(totalSlots = 6) {
  const [frames, setFrames] = useState<FrameItem[]>(() =>
    Array.from({ length: totalSlots }, (_, i) => ({
      id: `slot-${i + 1}`,
      dataUrl: '',
      mirrored: false,
      isBlank: true,
    }))
  );

  const resetFrames = useCallback(() => {
    setFrames(
      Array.from({ length: totalSlots }, (_, i) => ({
        id: `slot-${i + 1}`,
        dataUrl: '',
        mirrored: false,
        isBlank: true,
      }))
    );
  }, [totalSlots]);

  const setFrameAt = useCallback((index: number, dataUrl: string, owner?: 'host' | 'guest') => {
    setFrames((prev) => {
      const next = [...prev];
      if (index >= 0 && index < next.length) {
        next[index] = {
          ...next[index],
          dataUrl,
          isBlank: false,
          owner: owner || next[index].owner,
        };
      }
      return next;
    });
  }, []);

  const toggleFrameMirror = useCallback((index: number) => {
    setFrames((prev) => {
      const next = [...prev];
      if (index >= 0 && index < next.length) {
        next[index] = {
          ...next[index],
          mirrored: !next[index].mirrored,
        };
      }
      return next;
    });
  }, []);

  const toggleFrameBlank = useCallback((index: number) => {
    setFrames((prev) => {
      const next = [...prev];
      if (index >= 0 && index < next.length) {
        next[index] = {
          ...next[index],
          isBlank: !next[index].isBlank,
        };
      }
      return next;
    });
  }, []);

  const reorderFrames = useCallback((newOrder: FrameItem[]) => {
    setFrames(newOrder);
  }, []);

  const swapFrames = useCallback((fromIndex: number, toIndex: number) => {
    setFrames((prev) => {
      const next = [...prev];
      const temp = next[fromIndex];
      next[fromIndex] = next[toIndex];
      next[toIndex] = temp;
      return next;
    });
  }, []);

  // Cleanup object URLs or bitmapped memory if any
  useEffect(() => {
    return () => {
      frames.forEach((f) => {
        if (f.bitmap) {
          f.bitmap.close();
        }
      });
    };
  }, [frames]);

  return {
    frames,
    setFrames,
    resetFrames,
    setFrameAt,
    toggleFrameMirror,
    toggleFrameBlank,
    reorderFrames,
    swapFrames,
  };
}
