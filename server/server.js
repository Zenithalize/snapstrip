import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

// Health check route for browser visits
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SnapStrip Multi-Player Co-Op Signaling Server',
    maxRoomCapacity: 6,
    activeRooms: rooms.size,
    timestamp: new Date().toISOString(),
  });
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 1e8, // 100MB buffer size to prevent dropping large frame payloads
});

// Map<code, { host: string, members: Array<{ id: string, playerIndex: number }>, maxPlayers: number }>
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function broadcastRoomState(code) {
  const room = rooms.get(code);
  if (!room) return;

  room.members.forEach((member, idx) => {
    io.to(member.id).emit('room_update', {
      code,
      membersCount: room.members.length,
      maxPlayers: room.maxPlayers,
      playerIndex: idx,
      isHost: room.host === member.id,
    });
  });
}

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  socket.on('create_room', (options = {}, callback) => {
    // Handle both signature: create_room(callback) and create_room(options, callback)
    const cb = typeof options === 'function' ? options : callback;
    const requestedMax = typeof options === 'object' && options.maxPlayers ? options.maxPlayers : 6;
    const maxPlayers = Math.min(6, Math.max(2, requestedMax));

    let code = generateRoomCode();
    while (rooms.has(code)) {
      code = generateRoomCode();
    }

    rooms.set(code, {
      host: socket.id,
      members: [{ id: socket.id, playerIndex: 0 }],
      maxPlayers,
    });

    socket.join(code);
    socket.roomCode = code;

    if (typeof cb === 'function') {
      cb({ ok: true, code, playerIndex: 0, maxPlayers });
    }

    broadcastRoomState(code);
  });

  socket.on('join_room', ({ code }, callback) => {
    const cleanCode = code ? code.toUpperCase().trim() : '';
    const room = rooms.get(cleanCode);

    if (!room) {
      if (typeof callback === 'function') {
        callback({ ok: false, message: 'Room code not found' });
      }
      return;
    }

    if (room.members.length >= room.maxPlayers) {
      if (typeof callback === 'function') {
        callback({ ok: false, message: `Room is full (Max ${room.maxPlayers} players)` });
      }
      return;
    }

    const assignedIndex = room.members.length;
    room.members.push({ id: socket.id, playerIndex: assignedIndex });

    socket.join(cleanCode);
    socket.roomCode = cleanCode;

    if (typeof callback === 'function') {
      callback({ ok: true, playerIndex: assignedIndex, maxPlayers: room.maxPlayers });
    }

    socket.to(cleanCode).emit('peer_joined', { peerId: socket.id, playerIndex: assignedIndex });
    broadcastRoomState(cleanCode);
  });

  socket.on('send_frame', ({ slot, dataUrl }) => {
    if (socket.roomCode) {
      console.log(`[Socket.IO] Broadcast frame for slot ${slot} in room ${socket.roomCode}`);
      // Send to all members in the room (including sender & peers)
      io.in(socket.roomCode).emit('receive_frame', { slot, dataUrl, sender: socket.id });
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
        room.members = room.members.filter((m) => m.id !== socket.id);
        socket.to(socket.roomCode).emit('peer_left', { peerId: socket.id });

        if (room.members.length === 0) {
          rooms.delete(socket.roomCode);
        } else {
          if (room.host === socket.id) {
            room.host = room.members[0].id;
          }
          broadcastRoomState(socket.roomCode);
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[SnapStrip Multi-Player Server] Listening on http://localhost:${PORT}`);
});
