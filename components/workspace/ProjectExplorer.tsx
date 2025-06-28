import React, { useState } from 'react';
import { Folder, File, Plus, Trash2, Edit2, FileText, Code, Database, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export type FileNode = {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
};

interface ProjectExplorerProps {
  tree: FileNode[];
  onFileOpen: (path: string) => void;
  onTreeChange: (tree: FileNode[]) => void;
  openFilePath: string | null;
}

// File templates for different file types
const getFileTemplate = (filename: string): string => {
  // Return empty content for all files
  return '';
};

// Get file icon based on extension
const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const iconMap: { [key: string]: any } = {
    'py': Code,
    'js': Code,
    'ts': Code,
    'jsx': Code,
    'tsx': Code,
    'html': FileText,
    'css': FileText,
    'json': FileText,
    'md': FileText,
    'sql': Database,
    'dockerfile': Settings,
    'yml': Settings,
    'yaml': Settings,
    'env': Settings,
    'gitignore': Settings,
  };
  return iconMap[ext || ''] || File;
};

// Find node by path
function findNodeByPath(nodes: FileNode[], path: string): FileNode | null {
  const parts = path.split('/');
  let current = nodes;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const node = current.find(n => n.name === parts[i]);
    if (!node || node.type !== 'folder') return null;
    current = node.children || [];
  }
  
  return current.find(n => n.name === parts[parts.length - 1]) || null;
}

// Update node by path
function updateNodeByPath(nodes: FileNode[], path: string, updates: Partial<FileNode>): FileNode[] {
  const parts = path.split('/');
  if (parts.length === 1) {
    return nodes.map(node => node.name === parts[0] ? { ...node, ...updates } : node);
  }
  
  return nodes.map(node => {
    if (node.name === parts[0] && node.type === 'folder') {
      return {
        ...node,
        children: updateNodeByPath(node.children || [], parts.slice(1).join('/'), updates)
      };
    }
    return node;
  });
}

// Delete node by path
function deleteNodeByPath(nodes: FileNode[], path: string): FileNode[] {
  const parts = path.split('/');
  if (parts.length === 1) {
    return nodes.filter(node => node.name !== parts[0]);
  }
  
  return nodes.map(node => {
    if (node.name === parts[0] && node.type === 'folder') {
      return {
        ...node,
        children: deleteNodeByPath(node.children || [], parts.slice(1).join('/'))
      };
    }
    return node;
  });
}

function renderTree(
  nodes: FileNode[],
  parentPath: string,
  onFileOpen: (path: string) => void,
  openFilePath: string | null,
  onRename: (path: string, newName: string) => void,
  onDelete: (path: string) => void
) {
  return (
    <ul className="pl-1 sm:pl-2">
      {nodes.map((node) => {
        const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;
        const FileIcon = node.type === 'folder' ? Folder : getFileIcon(node.name);
        const isActive = openFilePath === fullPath;
        
        return (
          <li key={fullPath} className="mb-1">
            <div className={`flex items-center gap-1 sm:gap-2 px-2 py-2 sm:py-1 rounded group ${isActive ? 'bg-indigo-900/30 border border-indigo-500/30' : 'hover:bg-slate-800/50'}`}> 
              <FileIcon className={`w-4 h-4 flex-shrink-0 ${node.type === 'folder' ? 'text-yellow-400' : 'text-slate-300'}`} />
              <span
                className={`cursor-pointer select-none flex-1 text-sm sm:text-base truncate ${node.type === 'file' ? 'hover:text-white' : ''}`}
                onClick={() => node.type === 'file' && onFileOpen(fullPath)}
              >
                {node.name}
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-shrink-0">
                <button 
                  onClick={() => {
                    const newName = prompt('Enter new name:', node.name);
                    if (newName && newName !== node.name) {
                      onRename(fullPath, newName);
                    }
                  }} 
                  className="text-xs text-slate-400 hover:text-white p-1"
                  title="Rename"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete "${node.name}"?`)) {
                      onDelete(fullPath);
                    }
                  }} 
                  className="text-xs text-red-400 hover:text-red-300 p-1"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            {node.type === 'folder' && node.children && renderTree(node.children, fullPath, onFileOpen, openFilePath, onRename, onDelete)}
          </li>
        );
      })}
    </ul>
  );
}

export function ProjectExplorer({ tree, onFileOpen, onTreeChange, openFilePath }: ProjectExplorerProps) {
  const [showFileMenu, setShowFileMenu] = useState(false);

  const addFile = () => {
    const filename = prompt('Enter file name (with extension):');
    if (filename) {
      const template = getFileTemplate(filename);
      onTreeChange([...tree, { name: filename, type: 'file', content: template }]);
      toast.success(`Created ${filename}`);
    }
  };

  const addFolder = () => {
    const name = prompt('Enter folder name:');
    if (name) {
      onTreeChange([...tree, { name, type: 'folder', children: [] }]);
      toast.success(`Created folder ${name}`);
    }
  };

  const handleRename = (path: string, newName: string) => {
    const node = findNodeByPath(tree, path);
    if (node) {
      const updatedTree = updateNodeByPath(tree, path, { name: newName });
      onTreeChange(updatedTree);
      toast.success(`Renamed to ${newName}`);
    }
  };

  const handleDelete = (path: string) => {
    const updatedTree = deleteNodeByPath(tree, path);
    onTreeChange(updatedTree);
    toast.success('File deleted');
  };

  const quickAddFiles = [
    { name: 'app.py', icon: Code },
    { name: 'index.js', icon: Code },
    { name: 'index.html', icon: FileText },
    { name: 'style.css', icon: FileText },
    { name: 'package.json', icon: FileText },
    { name: 'README.md', icon: FileText },
  ];

  return (
    <div className="w-full lg:w-64 bg-slate-900/80 border-r border-slate-800 h-full flex flex-col">
      <div className="flex items-center justify-between p-2 sm:p-3 border-b border-slate-800">
        <span className="font-bold text-slate-200 text-xs sm:text-sm">Project Files</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFileMenu(!showFileMenu)}
            className="text-slate-400 hover:text-white p-1 sm:p-2"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Add Menu */}
      {showFileMenu && (
        <div className="border-b border-slate-800 p-2 bg-slate-800/50">
          <div className="text-xs text-slate-400 mb-2">Quick Add:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {quickAddFiles.map((file) => {
              const Icon = file.icon;
              return (
                <button
                  key={file.name}
                  onClick={() => {
                    const template = getFileTemplate(file.name);
                    onTreeChange([...tree, { name: file.name, type: 'file', content: template }]);
                    setShowFileMenu(false);
                    toast.success(`Created ${file.name}`);
                  }}
                  className="flex items-center gap-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 p-2 rounded"
                >
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-1 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={addFile}
              className="text-xs text-slate-400 hover:text-white flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Custom File</span>
              <span className="sm:hidden">File</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={addFolder}
              className="text-xs text-slate-400 hover:text-white flex-1 sm:flex-none"
            >
              Folder
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {tree.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">No files yet</div>
            <div className="text-xs">Click + to add files</div>
          </div>
        ) : (
          renderTree(tree, '', onFileOpen, openFilePath, handleRename, handleDelete)
        )}
      </div>
    </div>
  );
} 