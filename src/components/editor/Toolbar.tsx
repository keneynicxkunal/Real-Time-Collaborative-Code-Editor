'use client'

import { Play, Share2, Settings, Users, Copy, Check, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

interface ToolbarProps {
  onRun: () => void
  language: string
  onLanguageChange: (language: string) => void
  roomId?: string
  onShare?: () => void
  onSettings?: () => void
  userCount?: number
  onLeaveRoom?: () => void
  isRunning?: boolean
}

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'cpp', label: 'C++' },
  { value: 'react', label: 'React (JSX)' },
]

export default function Toolbar({
  onRun,
  language,
  onLanguageChange,
  roomId,
  onShare,
  onSettings,
  userCount,
  onLeaveRoom,
  isRunning = false,
}: ToolbarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    if (roomId) {
      const url = `${window.location.origin}?room=${roomId}`
      navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="CodeCollab"
            className="w-8 h-8 rounded-lg"
          />
          <span className="font-semibold text-white hidden sm:block">CodeCollab</span>
        </div>

        <div className="h-6 w-px bg-zinc-700 mx-2" />

        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[140px] bg-zinc-800 border-zinc-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {LANGUAGES.map((lang) => (
              <SelectItem
                key={lang.value}
                value={lang.value}
                className="text-white hover:bg-zinc-700"
              >
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {roomId && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
              Room: {roomId}
            </Badge>
            {userCount !== undefined && (
              <Badge variant="outline" className="bg-zinc-800 text-zinc-300 border-zinc-700">
                <Users className="w-3 h-3 mr-1" />
                {userCount}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {roomId && (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              <span className="hidden sm:inline">Copy Link</span>
            </Button>
            {onLeaveRoom && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLeaveRoom}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Leave</span>
              </Button>
            )}
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onShare}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Share2 className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Settings className="w-4 h-4" />
        </Button>

        <div className="h-6 w-px bg-zinc-700 mx-1" />

        <Button
          onClick={onRun}
          disabled={isRunning}
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
        >
          <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRunning ? 'Running...' : 'Run'}</span>
        </Button>
      </div>
    </div>
  )
}
