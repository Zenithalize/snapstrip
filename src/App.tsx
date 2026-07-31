import { useState, useCallback, useEffect } from 'react';
import type { AppState, BackgroundConfig, FilterId, StripMeta, Sticker } from './types/photobooth';
import { useCamera } from './hooks/useCamera';
import { useCountdown } from './hooks/useCountdown';
import { usePhotoStrip } from './hooks/usePhotoStrip';
import { useCoOp } from './hooks/useCoOp';
import { HeaderBar } from './components/HeaderBar';
import { LandingSetup } from './components/LandingSetup';
import { CameraView } from './components/CameraView';
import { StripEditor } from './components/StripEditor';
import { ExportView } from './components/ExportView';
import { CoOpModal } from './components/CoOpModal';

export function App() {
  const [currentState, setCurrentState] = useState<AppState>('SETUP');
  const [background, setBackground] = useState<BackgroundConfig>({ type: 'holographic' });
  const [selectedFilter, setSelectedFilter] = useState<FilterId>('none');
  const [meta, setMeta] = useState<StripMeta>({
    date: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
    label: 'SnapStrip ✨',
    font: 'Caveat',
    textColor: '#2d1b69',
  });
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [isCoOpModalOpen, setIsCoOpModalOpen] = useState(false);
  const [isMirroredPreview, setIsMirroredPreview] = useState(true);
  const [renderedCanvas, setRenderedCanvas] = useState<HTMLCanvasElement | null>(null);

  const { frames, setFrameAt, resetFrames, toggleFrameMirror, toggleFrameBlank, reorderFrames } = usePhotoStrip(6);
  const { videoRef, isReady, error, startCamera, stopCamera, switchCamera, captureFrame } = useCamera();
  const { roomState, error: coOpError, createRoom, joinRoom, emitShootStart, sendFrame, leaveRoom, socket } = useCoOp();

  const handleStartShoot = useCallback(async () => {
    setCurrentState('COUNTDOWN');
    await startCamera();
    startShootSequence();
  }, [startCamera]);

  // Callback when countdown reaches 0 to capture frame
  const handleCaptureFrame = useCallback(
    (shotIdx: number) => {
      const isCoOp = roomState.connected && !!roomState.code;

      if (isCoOp) {
        // Interleaved logic:
        // Host captures even slots: 0, 2, 4
        // Guest captures odd slots: 1, 3, 5
        const isMyTurn = roomState.isHost ? shotIdx % 2 === 0 : shotIdx % 2 === 1;

        if (isMyTurn) {
          const dataUrl = captureFrame(!isMirroredPreview);
          if (dataUrl) {
            setFrameAt(shotIdx, dataUrl, roomState.isHost ? 'host' : 'guest');
            sendFrame(shotIdx, dataUrl);
          }
        }
      } else {
        // Solo mode: capture all shots
        const dataUrl = captureFrame(!isMirroredPreview);
        if (dataUrl) {
          setFrameAt(shotIdx, dataUrl);
        }
      }
    },
    [captureFrame, isMirroredPreview, setFrameAt, roomState, sendFrame]
  );

  // Callback when all 6 shots complete
  const handleCompleteAllShots = useCallback(() => {
    stopCamera();
    setCurrentState('REVIEW');
  }, [stopCamera]);

  const {
    currentShot,
    totalShots,
    countdownValue,
    countdownState,
    flashActive,
    startShootSequence,
    stopShootSequence,
    retakeSingleShot,
  } = useCountdown({
    totalShots: 6,
    countdownSeconds: 3,
    delayBetweenShots: 1500,
    onCaptureFrame: handleCaptureFrame,
    onCompleteAllShots: handleCompleteAllShots,
  });

  // Listen for socket events in co-op mode
  useEffect(() => {
    if (!socket) return;

    const handleReceiveFrame = (data: { slot: number; dataUrl: string }) => {
      setFrameAt(data.slot, data.dataUrl, roomState.isHost ? 'guest' : 'host');
    };

    const handleShootStartBroadcast = async () => {
      setIsCoOpModalOpen(false);
      setCurrentState('COUNTDOWN');
      await startCamera();
      startShootSequence();
    };

    socket.on('receive_frame', handleReceiveFrame);
    socket.on('shoot_start_broadcast', handleShootStartBroadcast);

    return () => {
      socket.off('receive_frame', handleReceiveFrame);
      socket.off('shoot_start_broadcast', handleShootStartBroadcast);
    };
  }, [socket, setFrameAt, roomState.isHost, startCamera, startShootSequence]);

  const handleRetakeSingleSlot = useCallback(
    async (slotIdx: number) => {
      setCurrentState('COUNTDOWN');
      await startCamera();
      retakeSingleShot(slotIdx);
    },
    [startCamera, retakeSingleShot]
  );

  const handleRetakeLastShot = useCallback(() => {
    if (currentShot > 0) {
      retakeSingleShot(currentShot - 1);
    } else {
      retakeSingleShot(0);
    }
  }, [currentShot, retakeSingleShot]);

  const handleUploadPhotos = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList).slice(0, 6);
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setFrameAt(index, e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      });
      setCurrentState('REVIEW');
    },
    [setFrameAt]
  );

  const handleAddSticker = useCallback((sticker: Sticker) => {
    setStickers((prev) => [...prev, sticker]);
  }, []);

  const handleUpdateSticker = useCallback((updatedSticker: Sticker) => {
    setStickers((prev) => prev.map((s) => (s.id === updatedSticker.id ? updatedSticker : s)));
  }, []);

  const handleRemoveSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleNewSession = useCallback(() => {
    resetFrames();
    setStickers([]);
    stopShootSequence();
    stopCamera();
    setRenderedCanvas(null);
    setCurrentState('SETUP');
  }, [resetFrames, stopShootSequence, stopCamera]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf6ff] text-[#2d1b69]">
      {/* Header */}
      <HeaderBar
        currentState={currentState}
        onNavigate={(state) => {
          if (state !== 'COUNTDOWN') {
            stopCamera();
          }
          setCurrentState(state);
        }}
        onOpenCoOp={() => setIsCoOpModalOpen(true)}
        isCoOpActive={roomState.connected && !!roomState.code}
      />

      {/* Main Body View Controller */}
      <main className="flex-1 pb-12">
        {currentState === 'SETUP' && (
          <LandingSetup
            background={background}
            onChangeBackground={setBackground}
            selectedFilter={selectedFilter}
            onChangeFilter={setSelectedFilter}
            onStartShoot={handleStartShoot}
            onOpenCoOp={() => setIsCoOpModalOpen(true)}
            onUploadPhotos={handleUploadPhotos}
          />
        )}

        {currentState === 'COUNTDOWN' && (
          <CameraView
            videoRef={videoRef}
            isReady={isReady}
            error={error}
            currentShot={currentShot}
            totalShots={totalShots}
            countdownValue={countdownValue}
            countdownState={countdownState}
            flashActive={flashActive}
            capturedFrames={frames}
            filterId={selectedFilter}
            onStartShoot={startShootSequence}
            onRetakeLastShot={handleRetakeLastShot}
            onSwitchCamera={switchCamera}
            onStartCamera={startCamera}
            isMirroredPreview={isMirroredPreview}
            onToggleMirrorPreview={() => setIsMirroredPreview((prev) => !prev)}
          />
        )}

        {currentState === 'REVIEW' && (
          <StripEditor
            frames={frames}
            onReorderFrames={reorderFrames}
            onRetakeSlot={handleRetakeSingleSlot}
            onToggleMirrorSlot={toggleFrameMirror}
            onToggleBlankSlot={toggleFrameBlank}
            background={background}
            onChangeBackground={setBackground}
            selectedFilter={selectedFilter}
            onChangeFilter={setSelectedFilter}
            meta={meta}
            onChangeMeta={setMeta}
            stickers={stickers}
            onAddSticker={handleAddSticker}
            onUpdateSticker={handleUpdateSticker}
            onRemoveSticker={handleRemoveSticker}
            onProceedToExport={() => setCurrentState('EXPORT')}
            onCanvasGenerated={setRenderedCanvas}
          />
        )}

        {currentState === 'EXPORT' && (
          <ExportView canvas={renderedCanvas} onNewSession={handleNewSession} />
        )}
      </main>

      {/* Co-Op Multiplayer Modal */}
      <CoOpModal
        isOpen={isCoOpModalOpen}
        onClose={() => setIsCoOpModalOpen(false)}
        roomState={roomState}
        error={coOpError}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        onLeaveRoom={leaveRoom}
        onStartCoOpShoot={() => {
          setIsCoOpModalOpen(false);
          emitShootStart();
        }}
      />
    </div>
  );
}

export default App;
