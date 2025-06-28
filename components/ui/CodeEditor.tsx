'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, 
  Download, 
  Maximize2, 
  Minimize2, 
  Save, 
  MessageSquare,
  Check,
  Loader2,
  Settings,
  Palette
} from 'lucide-react';
import { Button } from './button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  filename?: string;
  onChange?: (code: string) => void;
  onSave?: (code: string) => void;
  onCommentCode?: (code: string) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
  readOnly?: boolean;
  className?: string;
  height?: string | number;
  theme?: 'vs-dark' | 'light' | 'vs';
  commenting?: boolean;
}

const SUPPORTED_LANGUAGES = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  html: 'html',
  css: 'css',
  json: 'json',
  markdown: 'markdown',
  yaml: 'yaml',
  dockerfile: 'dockerfile',
  shell: 'shell',
  sql: 'sql',
};

const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    json: 'json',
    md: 'markdown',
    yml: 'yaml',
    yaml: 'yaml',
    dockerfile: 'dockerfile',
    sh: 'shell',
    bash: 'shell',
    sql: 'sql',
  };
  return langMap[ext || ''] || 'plaintext';
};

export function CodeEditor({
  initialCode = '',
  language,
  filename = 'untitled.txt',
  onChange,
  onSave,
  onCommentCode,
  autoSave = false,
  autoSaveDelay = 2000,
  readOnly = false,
  className,
  height = '400px',
  theme = 'vs-dark',
  commenting = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editorTheme, setEditorTheme] = useState(theme);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('off');
  
  const editorRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const detectedLanguage = language || getLanguageFromFilename(filename);

  // Debounced auto-save
  const debouncedSave = useDebounce(async (codeToSave: string) => {
    if (autoSave && onSave && codeToSave !== initialCode) {
      setIsSaving(true);
      try {
        await onSave(codeToSave);
        setLastSaved(new Date());
        toast.success('Auto-saved', { duration: 2000 });
      } catch (error) {
        toast.error('Auto-save failed');
      } finally {
        setIsSaving(false);
      }
    }
  }, autoSaveDelay);

  const handleEditorChange = useCallback((value: string | undefined) => {
    const newCode = value || '';
    setCode(newCode);
    onChange?.(newCode);
    
    if (autoSave) {
      debouncedSave(newCode);
    }
  }, [onChange, autoSave, debouncedSave]);

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(code);
      setLastSaved(new Date());
      toast.success('File saved successfully');
    } catch (error) {
      toast.error('Failed to save file');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  const handleCommentCode = () => {
    if (onCommentCode) {
      onCommentCode(code);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'Enter':
            if (e.shiftKey) {
              e.preventDefault();
              toggleFullscreen();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [code]);

  const editorOptions = {
    fontSize,
    wordWrap,
    minimap: { enabled: !isFullscreen },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    detectIndentation: true,
    folding: true,
    lineNumbers: 'on' as const,
    renderWhitespace: 'selection' as const,
    cursorBlinking: 'smooth' as const,
    smoothScrolling: true,
    contextmenu: true,
    mouseWheelZoom: true,
    readOnly,
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-slate-900 rounded-lg overflow-hidden border border-slate-700/50',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          
          <div className="text-sm text-slate-300 font-medium">
            {filename}
          </div>
          
          <div className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded">
            {detectedLanguage}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {lastSaved && (
            <div className="text-xs text-slate-500 mr-2">
              Saved {lastSaved.toLocaleTimeString()}
            </div>
          )}
          
          {isSaving && (
            <div className="flex items-center text-xs text-slate-400 mr-2">
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
              Saving...
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-slate-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-slate-400 hover:text-white"
          >
            <Copy className="w-4 h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-slate-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </Button>

          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="text-slate-400 hover:text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
            </Button>
          )}

          {onCommentCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCommentCode}
              disabled={commenting}
              className="text-slate-400 hover:text-white"
            >
              {commenting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4" />
              )}
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-slate-400 hover:text-white"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800/80 border-b border-slate-700/50 p-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Theme</label>
                <select
                  value={editorTheme}
                  onChange={(e) => setEditorTheme(e.target.value as any)}
                  className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1"
                >
                  <option value="vs-dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="vs">Visual Studio</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1">Font Size</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-slate-500">{fontSize}px</div>
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-1">Word Wrap</label>
                <select
                  value={wordWrap}
                  onChange={(e) => setWordWrap(e.target.value as 'on' | 'off')}
                  className="w-full bg-slate-700 text-white text-sm rounded px-2 py-1"
                >
                  <option value="off">Off</option>
                  <option value="on">On</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor */}
      <div className={cn(
        'relative',
        isFullscreen ? 'h-[calc(100vh-120px)]' : typeof height === 'string' ? height : `${height}px`
      )}>
        <Editor
          height={typeof height === 'string' ? height : `${height}px`}
          language={detectedLanguage}
          value={code}
          onChange={handleEditorChange}
          theme={editorTheme}
          options={editorOptions}
          onMount={(editor, monaco) => {
            editorRef.current = editor;
            if (!monaco) return;
            // Add custom keyboard shortcuts
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
              handleSave();
            });
            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
              toggleFullscreen();
            });
          }}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <div className="text-sm text-slate-400">Loading editor...</div>
              </div>
            </div>
          }
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-slate-800/30 border-t border-slate-700/50 text-xs text-slate-500">
        <div className="flex items-center space-x-4">
          <span>Lines: {code.split('\n').length}</span>
          <span>Characters: {code.length}</span>
          <span>Language: {detectedLanguage}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {autoSave && (
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1" />
              Auto-save enabled
            </span>
          )}
          
          <span>Ctrl+S to save</span>
        </div>
      </div>
    </div>
  );
}