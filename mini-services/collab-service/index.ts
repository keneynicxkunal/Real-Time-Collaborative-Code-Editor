import { createServer } from 'http'
import { Server } from 'socket.io'
import { setupWSConnection } from 'y-websocket/bin/utils'
import { Doc } from 'yjs'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

interface User {
  id: string
  username: string
  color: string
}

interface Room {
  id: string
  users: Map<string, User>
}

const rooms = new Map<string, Room>()

const generateColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']
  return colors[Math.floor(Math.random() * colors.length)]
}

const getRoom = (roomId: string): Room => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { id: roomId, users: new Map() })
  }
  return rooms.get(roomId)!
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  socket.on('join-room', (data: { roomId: string; username: string }) => {
    const { roomId, username } = data
    const room = getRoom(roomId)

    const user: User = {
      id: socket.id,
      username: username || 'Anonymous',
      color: generateColor()
    }

    room.users.set(socket.id, user)
    socket.join(roomId)

    // Send user list to everyone in the room
    const usersList = Array.from(room.users.values())
    io.to(roomId).emit('users-updated', { roomId, users: usersList })

    // Notify others
    socket.to(roomId).emit('user-joined', { user, roomId })

    console.log(`User ${username} joined room ${roomId}. Total users: ${room.users.size}`)
  })

  socket.on('leave-room', (data: { roomId: string }) => {
    const { roomId } = data
    const room = rooms.get(roomId)

    if (room && room.users.has(socket.id)) {
      const user = room.users.get(socket.id)!
      room.users.delete(socket.id)
      socket.leave(roomId)

      // Send updated user list
      const usersList = Array.from(room.users.values())
      io.to(roomId).emit('users-updated', { roomId, users: usersList })

      // Notify others
      socket.to(roomId).emit('user-left', { user: { id: socket.id, username: user.username, color: user.color }, roomId })

      // Clean up empty rooms
      if (room.users.size === 0) {
        rooms.delete(roomId)
      }

      console.log(`User ${user.username} left room ${roomId}`)
    }
  })

  socket.on('cursor-move', (data: { roomId: string; position: number; selection: [number, number] }) => {
    const { roomId, position, selection } = data
    const room = rooms.get(roomId)

    if (room && room.users.has(socket.id)) {
      const user = room.users.get(socket.id)!
      socket.to(roomId).emit('cursor-updated', {
        userId: socket.id,
        username: user.username,
        color: user.color,
        position,
        selection
      })
    }
  })

  socket.on('disconnecting', () => {
    // Remove user from all rooms they're in
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        const room = rooms.get(roomId)
        if (room && room.users.has(socket.id)) {
          const user = room.users.get(socket.id)!
          room.users.delete(socket.id)

          const usersList = Array.from(room.users.values())
          io.to(roomId).emit('users-updated', { roomId, users: usersList })

          socket.to(roomId).emit('user-left', {
            user: { id: socket.id, username: user.username, color: user.color },
            roomId
          })

          if (room.users.size === 0) {
            rooms.delete(roomId)
          }
        }
      }
    })
  })

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`)
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3004
httpServer.listen(PORT, () => {
  console.log(`Collaboration WebSocket server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...')
  httpServer.close(() => {
    console.log('Collaboration WebSocket server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...')
  httpServer.close(() => {
    console.log('Collaboration WebSocket server closed')
    process.exit(0)
  })
})
