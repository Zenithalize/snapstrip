import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { CoOpRoom } from '../types/photobooth';

const DEFAULT_SERVER_URL =
  import.meta.env.VITE_COOP_SERVER_URL ||
  (typeof window !== 'undefined'
    ? window.location.port === '5173'
      ? 'http://localhost:3001'
      : 'https://snapstrip.onrender.com'
    : 'https://snapstrip.onrender.com');

export function useCoOp(serverUrl = DEFAULT_SERVER_URL) {
  const [roomState, setRoomState] = useState<CoOpRoom>({
    code: '',
    isHost: false,
    connected: false,
    peerConnected: false,
    myTurn: true,
  });

  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  const initSocket = useCallback(() => {
    if (socketRef.current) return socketRef.current;

    const socket = io(serverUrl, {
      autoConnect: false,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 30000, // 30s timeout for Render free tier cold-start
    });

    socket.on('connect', () => {
      setRoomState((prev) => ({ ...prev, connected: true }));
      setError(null);
    });

    socket.on('disconnect', () => {
      setRoomState((prev) => ({ ...prev, connected: false, peerConnected: false }));
    });

    socket.on('peer_joined', () => {
      setRoomState((prev) => ({ ...prev, peerConnected: true }));
    });

    socket.on('peer_left', () => {
      setRoomState((prev) => ({ ...prev, peerConnected: false }));
    });

    socket.on('connect_error', () => {
      setError(`Server is waking up on Render (~30s). Please wait a moment and click Create Room again!`);
    });

    socketRef.current = socket;
    setSocketInstance(socket);
    return socket;
  }, [serverUrl]);

  const createRoom = useCallback(() => {
    setError('Waking up server...');
    const socket = initSocket();
    socket.connect();

    socket.emit('create_room', (res: { code: string; ok: boolean }) => {
      if (res.ok) {
        setError(null);
        setRoomState({
          code: res.code,
          isHost: true,
          connected: true,
          peerConnected: false,
          myTurn: true,
        });
      }
    });
  }, [initSocket]);

  const joinRoom = useCallback(
    (code: string) => {
      setError('Waking up server...');
      const socket = initSocket();
      socket.connect();

      socket.emit('join_room', { code: code.toUpperCase() }, (res: { ok: boolean; message?: string }) => {
        if (res.ok) {
          setError(null);
          setRoomState({
            code: code.toUpperCase(),
            isHost: false,
            connected: true,
            peerConnected: true,
            myTurn: false,
          });
        } else {
          setError(res.message || 'Room code not found or room is full.');
        }
      });
    },
    [initSocket]
  );

  const emitShootStart = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('shoot_start');
    }
  }, []);

  const sendFrame = useCallback((slot: number, dataUrl: string) => {
    if (socketRef.current) {
      socketRef.current.emit('send_frame', { slot, dataUrl });
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocketInstance(null);
    }
    setRoomState({
      code: '',
      isHost: false,
      connected: false,
      peerConnected: false,
      myTurn: true,
    });
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    roomState,
    error,
    createRoom,
    joinRoom,
    emitShootStart,
    sendFrame,
    leaveRoom,
    socket: socketInstance,
  };
}
