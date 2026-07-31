import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e8, // 100MB buffer size to prevent dropping large frame payloads
});

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('create_room', (callback) => {
    let code = generateRoomCode();
    while (rooms.has(code)) {
      code = generateRoomCode();
    }

    rooms.set(code, {
      host: socket.id,
      guest: null,
    });

    socket.join(code);
    socket.roomCode = code;

    if (typeof callback === 'function') {
      callback({ ok: true, code });
    }
  });

  socket.on('join_room', ({ code }, callback) => {
    const room = rooms.get(code);

    if (!room) {
      if (typeof callback === 'function') {
        callback({ ok: false, message: 'Room not found' });
      }
      return;
    }

    if (room.guest) {
      if (typeof callback === 'function') {
        callback({ ok: false, message: 'Room is full' });
      }
      return;
    }

    room.guest = socket.id;
    socket.join(code);
    socket.roomCode = code;

    socket.to(code).emit('peer_joined', { peerId: socket.id });

    if (typeof callback === 'function') {
      callback({ ok: true });
    }
  });

  socket.on('send_frame', ({ slot, dataUrl }) => {
    if (socket.roomCode) {
      console.log(`[Socket.IO] Relay frame for slot ${slot} in room ${socket.roomCode}`);
      socket.to(socket.roomCode).emit('receive_frame', { slot, dataUrl, sender: socket.id });
    }
  });

  socket.on('shoot_start', () => {
    if (socket.roomCode) {
      console.log(`[Socket.IO] Broadcast shoot_start in room ${socket.roomCode}`);
      io.in(socket.roomCode).emit('shoot_start_broadcast');
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    if (socket.roomCode) {
      const room = rooms.get(socket.roomCode);
      if (room) {
        socket.to(socket.roomCode).emit('peer_left');
        if (room.host === socket.id && room.guest === null) {
          rooms.delete(socket.roomCode);
        } else if (room.host === socket.id) {
          room.host = room.guest;
          room.guest = null;
        } else if (room.guest === socket.id) {
          room.guest = null;
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SnapStrip Co-Op Server] Listening on http://localhost:${PORT}`);
});
