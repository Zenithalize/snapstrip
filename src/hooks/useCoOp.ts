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
    playerIndex: 0,
    maxPlayers: 6,
    peerCount: 0,
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
      timeout: 30000,
    });

    socket.on('connect', () => {
      setRoomState((prev) => ({ ...prev, connected: true }));
      setError(null);
    });

    socket.on('disconnect', () => {
      setRoomState((prev) => ({ ...prev, connected: false, peerCount: 0 }));
    });

    socket.on('room_update', (data: { code: string; membersCount: number; maxPlayers: number; playerIndex: number; isHost: boolean }) => {
      setRoomState((prev) => ({
        ...prev,
        code: data.code || prev.code,
        isHost: data.isHost,
        playerIndex: data.playerIndex,
        maxPlayers: data.maxPlayers || prev.maxPlayers,
        peerCount: Math.max(0, data.membersCount - 1),
        connected: true,
      }));
    });

    socket.on('connect_error', () => {
      setError(`Server is waking up on Render (~30s). Please wait a moment and click Create Room again!`);
    });

    socketRef.current = socket;
    setSocketInstance(socket);
    return socket;
  }, [serverUrl]);

  const createRoom = useCallback(
    (maxPlayers = 6) => {
      setError('Waking up server...');
      const socket = initSocket();
      socket.connect();

      socket.emit('create_room', { maxPlayers }, (res: { code: string; ok: boolean; playerIndex?: number; maxPlayers?: number }) => {
        if (res.ok) {
          setError(null);
          setRoomState({
            code: res.code,
            isHost: true,
            connected: true,
            playerIndex: res.playerIndex ?? 0,
            maxPlayers: res.maxPlayers || maxPlayers,
            peerCount: 0,
            myTurn: true,
          });
        }
      });
    },
    [initSocket]
  );

  const joinRoom = useCallback(
    (code: string) => {
      setError('Waking up server...');
      const socket = initSocket();
      socket.connect();

      const cleanCode = code ? code.toUpperCase().trim() : '';

      socket.emit('join_room', { code: cleanCode }, (res: { ok: boolean; message?: string; playerIndex?: number; maxPlayers?: number }) => {
        if (res.ok) {
          setError(null);
          setRoomState({
            code: cleanCode,
            isHost: false,
            connected: true,
            playerIndex: res.playerIndex ?? 1,
            maxPlayers: res.maxPlayers || 6,
            peerCount: 1,
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
      playerIndex: 0,
      maxPlayers: 6,
      peerCount: 0,
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
