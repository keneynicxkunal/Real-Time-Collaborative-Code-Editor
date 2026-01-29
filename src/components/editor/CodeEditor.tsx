'use client'

import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

interface CodeEditorProps {
  code: string
  language: string
  onChange: (value: string | undefined) => void
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void
  readOnly?: boolean
  theme?: string
  height?: string
}

const LANGUAGES = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  cpp: 'cpp',
  react: 'javascript',
}

export default function CodeEditor({
  code,
  language,
  onChange,
  onMount,
  readOnly = false,
  theme = 'vs-dark',
  height = '100%',
}: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: any) => {
    editorRef.current = editor

    // Enable recommended features
    monaco.editor.setTheme(theme)

    // Configure editor options for VS Code-like experience
    editor.updateOptions({
      fontSize: 14,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
      fontLigatures: true,
      lineNumbers: 'on',
      minimap: { enabled: true },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      bracketPairColorization: { enabled: true },
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      autoSurround: 'languageDefined',
      formatOnPaste: true,
      formatOnType: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      wordBasedSuggestions: 'all',
      parameterHints: { enabled: true },
      folding: true,
      foldingHighlight: true,
      foldingStrategy: 'auto',
      showFoldingControls: 'always',
      matchBrackets: 'always',
      renderLineHighlight: 'all',
      occurrencesHighlight: true,
      codeLens: true,
      contextmenu: true,
      mouseWheelZoom: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      smoothScrolling: true,
    })

    // Configure IntelliSense
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions: any[] = [
          {
            label: 'console.log',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'console.log(${1:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Prints a message to the console',
          },
          {
            label: 'async/await',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'async function ${1:functionName}() {',
              '\ttry {',
              '\t\tconst result = await ${2:promise}',
              '\t\treturn result',
              '\t} catch (error) {',
              '\t\tconsole.error(error)',
              '\t}',
              '}',
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create an async function with error handling',
          },
        ]
        return { suggestions }
      },
    })

    monaco.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions: any[] = [
          {
            label: 'print',
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: 'print(${1:value})',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Print to console',
          },
          {
            label: 'if __name__',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
              'if __name__ == "__main__":',
              '\t${1:pass}',
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Main guard pattern',
          },
        ]
        return { suggestions }
      },
    })

    if (onMount) {
      onMount(editor)
    }
  }

  const mappedLanguage = LANGUAGES[language as keyof typeof LANGUAGES] || language

  return (
    <div className="w-full h-full">
      <Editor
        height={height}
        language={mappedLanguage}
        value={code}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme={theme}
        options={{
          readOnly,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          minimap: { enabled: true },
        }}
        loading={
          <div className="flex items-center justify-center h-full bg-zinc-900 text-zinc-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-400"></div>
          </div>
        }
      />
    </div>
  )
}
