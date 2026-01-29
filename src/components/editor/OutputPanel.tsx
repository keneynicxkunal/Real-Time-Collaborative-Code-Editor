'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, XCircle, AlertCircle, CheckCircle, Clock, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type OutputType = 'output' | 'error' | 'compile'

interface OutputEntry {
  type: OutputType
  content: string
  timestamp: Date
}

interface OutputPanelProps {
  outputs: OutputEntry[]
  isRunning?: boolean
  onClear?: () => void
}

export default function OutputPanel({ outputs, isRunning = false, onClear }: OutputPanelProps) {
  const outputsByType = {
    output: outputs.filter((o) => o.type === 'output'),
    error: outputs.filter((o) => o.type === 'error'),
    compile: outputs.filter((o) => o.type === 'compile'),
  }

  const getOutputIcon = (type: OutputType) => {
    switch (type) {
      case 'output':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'compile':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
    }
  }

  const getOutputColor = (type: OutputType) => {
    switch (type) {
      case 'output':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
      case 'compile':
        return 'text-yellow-400'
    }
  }

  const renderOutput = (entries: OutputEntry[]) => {
    if (entries.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12 text-zinc-500">
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400 mb-3" />
              <p className="text-sm">Running code...</p>
            </>
          ) : (
            <>
              <Play className="w-8 h-8 mb-3 opacity-50" />
              <p className="text-sm">No output yet</p>
              <p className="text-xs mt-1">Run your code to see the result</p>
            </>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-2 p-4">
        {entries.map((entry, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-md border border-zinc-700"
          >
            <div className="mt-0.5">{getOutputIcon(entry.type)}</div>
            <div className="flex-1 min-w-0">
              <pre className={`text-sm font-mono whitespace-pre-wrap break-words ${getOutputColor(entry.type)}`}>
                {entry.content}
              </pre>
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(entry.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-t border-zinc-800">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300">Output</h3>
        {outputs.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-8 px-2"
          >
            <Trash2 className="w-4 h-4" />
            <span className="ml-1 text-xs">Clear</span>
          </Button>
        )}
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="bg-zinc-800">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
            >
              All ({outputs.length})
            </TabsTrigger>
            <TabsTrigger
              value="output"
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
            >
              Output ({outputsByType.output.length})
            </TabsTrigger>
            <TabsTrigger
              value="error"
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
            >
              Errors ({outputsByType.error.length})
            </TabsTrigger>
            <TabsTrigger
              value="compile"
              className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
            >
              Compile ({outputsByType.compile.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="all" className="mt-0 h-full">
            {renderOutput(outputs)}
          </TabsContent>
          <TabsContent value="output" className="mt-0 h-full">
            {renderOutput(outputsByType.output)}
          </TabsContent>
          <TabsContent value="error" className="mt-0 h-full">
            {renderOutput(outputsByType.error)}
          </TabsContent>
          <TabsContent value="compile" className="mt-0 h-full">
            {renderOutput(outputsByType.compile)}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
