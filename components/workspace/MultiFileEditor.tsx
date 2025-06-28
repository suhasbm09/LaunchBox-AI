import React from 'react';
import { X } from 'lucide-react';
import { CodeEditor } from '@/components/ui/CodeEditor';
import { Button } from '@/components/ui/button';

interface OpenFile {
  path: string;
  name: string;
  content: string;
}

interface MultiFileEditorProps {
  openFiles: OpenFile[];
  activePath: string | null;
  onTabChange: (path: string) => void;
  onTabClose: (path: string) => void;
  onFileChange: (path: string, newContent: string) => void;
  onFileSave?: (path: string, content: string) => void;
  onCommentFile?: (path: string, content: string) => void;
  commenting?: boolean;
}

export function MultiFileEditor({ 
  openFiles, 
  activePath, 
  onTabChange, 
  onTabClose, 
  onFileChange, 
  onFileSave,
  onCommentFile, 
  commenting 
}: MultiFileEditorProps) {
  const activeFile = openFiles.find(f => f.path === activePath);

  const handleSave = async (content: string) => {
    if (activeFile && onFileSave) {
      await onFileSave(activeFile.path, content);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900/50 rounded-lg overflow-hidden min-h-0">
      {/* Tabs */}
      <div className="flex items-center border-b border-slate-800 bg-slate-800/60 overflow-x-auto scrollbar-hide">
        <div className="flex items-center min-w-max">
          {openFiles.map(file => (
            <div
              key={file.path}
              className={`flex items-center px-3 sm:px-4 py-2 cursor-pointer text-xs sm:text-sm border-r border-slate-800 whitespace-nowrap ${
                activePath === file.path ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-white'
              }`}
              onClick={() => onTabChange(file.path)}
            >
              <span className="truncate max-w-[80px] sm:max-w-[120px]">{file.name}</span>
              <button 
                onClick={e => { 
                  e.stopPropagation(); 
                  onTabClose(file.path); 
                }} 
                className="ml-1 sm:ml-2 text-xs text-slate-500 hover:text-red-400 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {activeFile ? (
          <>
            <div className="flex-1 overflow-y-auto min-h-0">
              <CodeEditor
                initialCode={activeFile.content}
                filename={activeFile.name}
                onChange={code => onFileChange(activeFile.path, code)}
                onSave={handleSave}
                autoSave={true}
                autoSaveDelay={3000}
              />
            </div>
            {onCommentFile && (
              <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-10">
                <Button
                  variant="secondary"
                  onClick={() => onCommentFile(activeFile.path, activeFile.content)}
                  disabled={commenting}
                  className="flex items-center gap-1 sm:gap-2 shadow-lg text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2"
                  style={{ minWidth: 'auto' }}
                >
                  {commenting ? <span className="animate-spin mr-1 sm:mr-2">⏳</span> : null}
                  <span className="hidden sm:inline">Comment My Code</span>
                  <span className="sm:hidden">Comment</span>
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 p-4">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-4">📝</div>
              <div className="text-base sm:text-lg font-medium mb-2">No file open</div>
              <div className="text-xs sm:text-sm text-slate-400">Select a file from the explorer to start coding</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 