'use client'

import { useState, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import CodeEditor from '@/components/editor/CodeEditor'
import Toolbar from '@/components/editor/Toolbar'
import Sidebar from '@/components/editor/Sidebar'
import OutputPanel, { OutputEntry } from '@/components/editor/OutputPanel'
import { toast } from 'sonner'

interface User {
  id: string
  username: string
  color: string
  isCurrentUser?: boolean
}

export default function Home() {
  const [code, setCode] = useState('// Welcome to CodeCollab!\n// Select a language and start coding\n\nconsole.log("Hello, World!");')
  const [language, setLanguage] = useState('javascript')
  const [roomId, setRoomId] = useState<string | undefined>()
  const [username, setUsername] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [outputs, setOutputs] = useState<OutputEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [showUsernameDialog, setShowUsernameDialog] = useState(false)

  // Check URL for room parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roomParam = urlParams.get('room')

    if (roomParam) {
      setRoomId(roomParam)
      setShowUsernameDialog(true)
    }
  }, [])

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    })

    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      console.log('Connected to collaboration server')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from collaboration server')
      setIsConnected(false)
    })

    socketInstance.on('users-updated', (data: { users: User[] }) => {
      setUsers(data.users.map((user) => ({
        ...user,
        isCurrentUser: user.id === socketInstance.id,
      })))
    })

    socketInstance.on('user-joined', (data: { user: User; roomId: string }) => {
      setUsers((prev) => [...prev, { ...data.user, isCurrentUser: false }])
      toast.success(`${data.user.username} joined the room`)
    })

    socketInstance.on('user-left', (data: { user: User; roomId: string }) => {
      setUsers((prev) => prev.filter((u) => u.id !== data.user.id))
      toast.info(`${data.user.username} left the room`)
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  // Join room when username is set and roomId exists
  useEffect(() => {
    if (username && roomId && socket) {
      socket.emit('join-room', { roomId, username })
    }
  }, [username, roomId, socket])

  const handleRun = async () => {
    setIsRunning(true)
    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: code, language }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Execution failed')
      }

      // Add outputs based on response
      const newOutputs: OutputEntry[] = []

      if (data.compileOutput) {
        newOutputs.push({
          type: 'compile',
          content: data.compileOutput,
          timestamp: new Date(),
        })
      }

      if (data.stderr) {
        newOutputs.push({
          type: 'error',
          content: data.stderr,
          timestamp: new Date(),
        })
      }

      if (data.stdout) {
        newOutputs.push({
          type: 'output',
          content: data.stdout,
          timestamp: new Date(),
        })
      }

      if (newOutputs.length === 0) {
        newOutputs.push({
          type: 'output',
          content: 'Program executed successfully with no output',
          timestamp: new Date(),
        })
      }

      setOutputs((prev) => [...prev, ...newOutputs])
    } catch (error) {
      setOutputs((prev) => [
        ...prev,
        {
          type: 'error',
          content: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
        },
      ])
      toast.error('Failed to execute code')
    } finally {
      setIsRunning(false)
    }
  }

  const handleJoinRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomId(newRoomId)
    setShowUsernameDialog(true)
  }

  const handleUsernameSubmit = () => {
    if (username.trim() && socket && isConnected) {
      setShowUsernameDialog(false)
      toast.success(`Joined room: ${roomId}`)
    }
  }

  const handleLeaveRoom = () => {
    if (roomId && socket) {
      socket.emit('leave-room', { roomId })
      setRoomId(undefined)
      setUsers([])
      toast.info('Left the room')
    }
  }

  const handleCopyRoomId = () => {
    if (roomId) {
      const url = `${window.location.origin}?room=${roomId}`
      navigator.clipboard.writeText(url)
      toast.success('Room link copied!')
    }
  }

  const handleClearOutput = () => {
    setOutputs([])
  }

  const handleShare = () => {
    if (roomId) {
      handleCopyRoomId()
    } else {
      handleJoinRoom()
    }
  }

  const handleSettings = () => {
    toast.info('Settings coming soon!')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Username Dialog */}
      {showUsernameDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {roomId ? 'Join Room' : 'Create Room'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Your Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autoFocus
                />
              </div>
              <div className="bg-zinc-800 p-3 rounded-md">
                <p className="text-xs text-zinc-500 mb-1">Room ID</p>
                <p className="text-lg font-mono text-orange-400">{roomId}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUsernameSubmit}
                  disabled={!username.trim() || !isConnected}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-900 disabled:cursor-not-allowed text-white rounded-md font-medium transition-colors"
                >
                  Join
                </button>
                <button
                  onClick={() => {
                    setShowUsernameDialog(false)
                    setRoomId(undefined)
                  }}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar
        onRun={handleRun}
        language={language}
        onLanguageChange={setLanguage}
        roomId={roomId}
        onShare={handleShare}
        onSettings={handleSettings}
        userCount={users.length}
        onLeaveRoom={handleLeaveRoom}
        isRunning={isRunning}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          users={users}
          roomId={roomId}
          isConnected={isConnected}
          onCopyRoomId={handleCopyRoomId}
        />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              code={code}
              language={language}
              onChange={(value) => setCode(value || '')}
              height="100%"
            />
          </div>

          {/* Output Panel */}
          <div className="h-64 overflow-hidden">
            <OutputPanel
              outputs={outputs}
              isRunning={isRunning}
              onClear={handleClearOutput}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-zinc-900 border-t border-zinc-800 flex items-center px-4 text-xs text-zinc-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span>{language}</span>
          {roomId && <span>Room: {roomId}</span>}
        </div>
        <div className="ml-auto flex items-center gap-4">
          <span>Users: {users.length}</span>
          <span>CodeCollab v1.0</span>
        </div>
      </div>
    </div>
  )
}
