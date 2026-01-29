'use client'

import { Users, User, Copy, Check, Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useState } from 'react'

interface SidebarProps {
  users: Array<{
    id: string
    username: string
    color: string
    isCurrentUser?: boolean
  }>
  roomId?: string
  isConnected?: boolean
  onCopyRoomId?: () => void
}

export default function Sidebar({
  users,
  roomId,
  isConnected = true,
  onCopyRoomId,
}: SidebarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyRoomId = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onCopyRoomId?.()
    }
  }

  return (
    <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* Connection Status */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          <span className="text-sm text-zinc-400">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Room ID */}
      {roomId && (
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Room ID</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-zinc-800 px-3 py-2 rounded-md">
                <code className="text-sm text-zinc-300">{roomId}</code>
              </div>
              <button
                onClick={handleCopyRoomId}
                className="p-2 hover:bg-zinc-800 rounded-md transition-colors"
                title="Copy Room ID"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">
                Active Users
              </span>
            </div>
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
              {users.length}
            </Badge>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {users.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No users in room</p>
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors"
                >
                  <Avatar className="w-8 h-8" style={{
                    backgroundColor: user.color + '20',
                    border: `2px solid ${user.color}`
                  }}>
                    <AvatarFallback
                      className="text-sm font-medium"
                      style={{ color: user.color }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">
                      {user.username}
                      {user.isCurrentUser && (
                        <span className="text-zinc-500 ml-1">(you)</span>
                      )}
                    </p>
                  </div>
                  {user.isCurrentUser && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700"
                    >
                      You
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          Collaborate in real-time
        </p>
      </div>
    </div>
  )
}
