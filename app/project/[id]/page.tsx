'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Rocket, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectsService } from '@/lib/projects';
import type { Project } from '@/lib/supabase';
import { TabNavigation, type TabType } from '@/components/workspace/TabNavigation';
import { CodeEditor } from '@/components/ui/CodeEditor';
import { StaticContent, dockerfileContent, jenkinsfileContent, devopsGuideContent } from '@/components/workspace/StaticContent';
import { DeployGrid } from '@/components/workspace/DeployGrid';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Dialog as CommentDialog, DialogContent as CommentDialogContent } from '@/components/ui/dialog';
import { ProjectExplorer, FileNode } from '@/components/workspace/ProjectExplorer';
import { MultiFileEditor } from '@/components/workspace/MultiFileEditor';

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('editor');
  const [generatedDockerfile, setGeneratedDockerfile] = useState('');
  const [generatedJenkinsfile, setGeneratedJenkinsfile] = useState('');
  const [generatedGuide, setGeneratedGuide] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [progress, setProgress] = useState<{dockerfile: boolean, jenkinsfile: boolean, guide: boolean}>({dockerfile: false, jenkinsfile: false, guide: false});
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentedCode, setCommentedCode] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode[]>([
    { name: 'app.py', type: 'file', content: '' },
  ]);
  const [openFiles, setOpenFiles] = useState<{ path: string; name: string; content: string }[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);

  const projectId = params.id as string;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ProjectsService.getProject(projectId);
        
        if (!data) {
          setError('Project not found');
          return;
        }
        
        setProject(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch project';
        setError(errorMessage);
        toast.error('Failed to load project', {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  function parseLLMResponse(response: string) {
    // Enhanced parsing with multiple fallback patterns
    let dockerfile = '';
    let jenkinsfile = '';
    let guide = '';

    // Try multiple patterns for Dockerfile
    const dockerfilePatterns = [
      /```dockerfile\s*([\s\S]*?)```/i,
      /```docker\s*([\s\S]*?)```/i,
      /Dockerfile:\s*([\s\S]*?)(?=```|Jenkinsfile:|Guide:|$)/i,
      /DOCKERFILE\s*([\s\S]*?)(?=JENKINSFILE|GUIDE|$)/i
    ];

    for (const pattern of dockerfilePatterns) {
      const match = response.match(pattern);
      if (match && match[1]?.trim()) {
        dockerfile = match[1].trim();
        break;
      }
    }

    // Try multiple patterns for Jenkinsfile
    const jenkinsfilePatterns = [
      /```groovy\s*([\s\S]*?)```/i,
      /```jenkinsfile\s*([\s\S]*?)```/i,
      /Jenkinsfile:\s*([\s\S]*?)(?=```|Guide:|$)/i,
      /JENKINSFILE\s*([\s\S]*?)(?=GUIDE|$)/i
    ];

    for (const pattern of jenkinsfilePatterns) {
      const match = response.match(pattern);
      if (match && match[1]?.trim()) {
        jenkinsfile = match[1].trim();
        break;
      }
    }

    // Try multiple patterns for Guide
    const guidePatterns = [
      /Guide:\s*([\s\S]*)/i,
      /GUIDE\s*([\s\S]*)/i,
      /DevOps Guide:\s*([\s\S]*)/i
    ];

    for (const pattern of guidePatterns) {
      const match = response.match(pattern);
      if (match && match[1]?.trim()) {
        guide = match[1].trim();
        break;
      }
    }

    // Provide fallback content if parsing fails
    if (!dockerfile) {
      dockerfile = `# Basic Dockerfile (generated as fallback)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]`;
    }

    if (!jenkinsfile) {
      jenkinsfile = `pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                echo 'Building...'
            }
        }
        stage('Test') {
            steps {
                echo 'Testing...'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying...'
            }
        }
    }
}`;
    }

    if (!guide) {
      guide = `Guide: Basic DevOps Setup

Step 1: Environment Setup
Set up your development environment with Docker and Jenkins installed. Ensure you have the necessary permissions and access to your deployment infrastructure.

Step 2: Build Process
Use the provided Dockerfile to build your application container. Run 'docker build -t your-app .' to create the image.

Step 3: Testing
Implement comprehensive testing using the Jenkinsfile pipeline. Ensure all tests pass before proceeding to deployment.

Step 4: Deployment
Deploy your application using the CI/CD pipeline. Monitor the deployment process and verify the application is running correctly.

Step 5: Monitoring
Set up monitoring and logging for your deployed application. Monitor performance metrics and application health.`;
    }

    return { dockerfile, jenkinsfile, guide };
  }

  async function analyzeWithOpenRouter(code: string, dockerfile?: string, jenkinsfile?: string) {
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          dockerfile,
          jenkinsfile,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await res.json();
      return data.response;
    } catch (error) {
      throw new Error('Failed to analyze project');
    }
  }

  async function commentMyCode(code: string) {
    setCommenting(true);
    setCommentedCode('');
    try {
      const res = await fetch('/api/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!res.ok) {
        throw new Error('Commenting failed');
      }
      
      const data = await res.json();
      // Extract code from code block if present
      const match = data.response.match(/```[\w]*\n([\s\S]*?)```/);
      setCommentedCode(match ? match[1] : data.response);
    } catch (err: any) {
      setCommentedCode('// Failed to generate comments: ' + err.message);
    } finally {
      setCommenting(false);
      setCommentModalOpen(true);
    }
  }

  // Helper to flatten file tree to {path, content}[]
  function flattenTree(nodes: FileNode[], parentPath = ''): { path: string; content: string }[] {
    let files: { path: string; content: string }[] = [];
    for (const node of nodes) {
      const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;
      if (node.type === 'file') {
        files.push({ path: fullPath, content: node.content || '' });
      } else if (node.type === 'folder' && node.children) {
        files = files.concat(flattenTree(node.children, fullPath));
      }
    }
    return files;
  }

  const handleAnalyzeProject = async () => {
    setAnalyzing(true);
    setProgress({dockerfile: false, jenkinsfile: false, guide: false});
    toast('Analyzing your project...', {
      description: 'AI is reviewing your code and generating DevOps configurations.',
      duration: 4000,
    });
    try {
      const allFiles = flattenTree(fileTree);
      // For now, concatenate all code for AI (improve later for context)
      const codeForAI = allFiles.map(f => `# File: ${f.path}\n${f.content}`).join('\n\n');
      const response = await analyzeWithOpenRouter(codeForAI);
      const parsed = parseLLMResponse(response);
      setGeneratedDockerfile(parsed.dockerfile || 'No Dockerfile generated.');
      setProgress((p) => ({...p, dockerfile: true}));
      setGeneratedJenkinsfile(parsed.jenkinsfile || 'No Jenkinsfile generated.');
      setProgress((p) => ({...p, jenkinsfile: true}));
      setGeneratedGuide(parsed.guide || 'No guide generated.');
      setProgress((p) => ({...p, guide: true}));
      setActiveTab('dockerfile');
      setAnalysisDone(true);
      toast.success('Analysis complete!');
    } catch (err: any) {
      toast.error('Failed to analyze project', {
        description: err.message,
      });
    } finally {
      setTimeout(() => setAnalyzing(false), 1200);
      setAnalyzing(false);
    }
  };

  const availableTabs: TabType[] = analysisDone
    ? ['editor', 'dockerfile', 'jenkinsfile', 'guide', 'deploy']
    : ['editor'];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'editor':
        return (
          <div className="flex flex-col lg:flex-row h-[70vh] min-h-[400px] bg-slate-900/60 rounded-lg overflow-hidden pb-24">
            {/* Project Explorer - Mobile: Full width, Desktop: Sidebar */}
            <div className="w-full lg:w-64 border-r border-slate-700/50 bg-slate-800/30">
              <ProjectExplorer
                tree={fileTree}
                onFileOpen={path => {
                  // Open file in tab if not already open
                  const node = findFileNodeByPath(fileTree, path);
                  if (!node) return;
                  setOpenFiles(files => files.some(f => f.path === path) ? files : [...files, { path, name: node.name, content: node.content || '' }]);
                  setActiveFilePath(path);
                }}
                onTreeChange={setFileTree}
                openFilePath={activeFilePath}
              />
            </div>
            {/* MultiFileEditor - Mobile: Full width, Desktop: Flexible */}
            <div className="flex-1 min-w-0">
              <MultiFileEditor
                openFiles={openFiles}
                activePath={activeFilePath}
                onTabChange={setActiveFilePath}
                onTabClose={path => {
                  setOpenFiles(files => files.filter(f => f.path !== path));
                  if (activeFilePath === path) {
                    // Switch to another open file if any
                    const idx = openFiles.findIndex(f => f.path === path);
                    const next = openFiles[idx + 1] || openFiles[idx - 1];
                    setActiveFilePath(next ? next.path : null);
                  }
                }}
                onFileChange={(path, newContent) => {
                  setOpenFiles(files => files.map(f => f.path === path ? { ...f, content: newContent } : f));
                  setFileTree(tree => updateFileContentInTree(tree, path, newContent));
                }}
                onFileSave={async (path, content) => {
                  // Update both open files and file tree
                  setOpenFiles(files => files.map(f => f.path === path ? { ...f, content } : f));
                  setFileTree(tree => updateFileContentInTree(tree, path, content));
                  
                  // Here you could also save to database or file system
                  toast.success(`Saved ${path}`);
                }}
                onCommentFile={async (path, content) => {
                  setCommenting(true);
                  setCommentedCode('');
                  try {
                    // Use the /api/comment endpoint for AI code commenting
                    const res = await fetch('/api/comment', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({ code: content }),
                    });
                    if (!res.ok) throw new Error('Commenting failed');
                    const data = await res.json();
                    // Extract code from code block if present
                    const match = data.response.match(/```[\w]*\n([\s\S]*?)```/);
                    setCommentedCode(match ? match[1] : data.response);
                  } catch (err: any) {
                    setCommentedCode('// Failed to generate comments: ' + err.message);
                  }
                  setCommenting(false);
                  setCommentModalOpen(true);
                }}
                commenting={commenting}
              />
            </div>
            {/* Commented Code Modal for active file */}
            <CommentDialog open={commentModalOpen} onOpenChange={setCommentModalOpen}>
              <CommentDialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                <h2 className="text-lg font-bold mb-2 text-white">AI-Generated Code Comments</h2>
                <div className="bg-slate-900 rounded p-4 overflow-x-auto max-h-[60vh]">
                  <pre className="text-xs text-slate-100 whitespace-pre-wrap">
                    {commentedCode || (commenting ? 'Generating comments...' : '')}
                  </pre>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(commentedCode);
                      toast.success('Commented code copied!');
                    }}
                    disabled={!commentedCode}
                  >Copy</Button>
                </div>
              </CommentDialogContent>
            </CommentDialog>
          </div>
        );
      case 'dockerfile':
        return (
          <StaticContent
            title="Dockerfile"
            content={generatedDockerfile}
            language="dockerfile"
          />
        );
      case 'jenkinsfile':
        return (
          <StaticContent
            title="Jenkinsfile"
            content={generatedJenkinsfile}
            language="groovy"
          />
        );
      case 'guide':
        return (
          <StaticContent
            title="DevOps Guide"
            content={generatedGuide}
            language="markdown"
          />
        );
      case 'deploy':
        return <DeployGrid />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Header Skeleton */}
        <div className="glass-morphism border-b border-slate-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 bg-slate-700/50" />
                <Skeleton className="h-6 w-48 bg-slate-700/50" />
              </div>
              <Skeleton className="h-8 w-32 bg-slate-700/50" />
            </div>
          </div>
        </div>
        
        {/* Tab Navigation Skeleton */}
        <div className="border-b border-slate-700/50 bg-slate-800/30">
          <div className="flex items-center space-x-1 px-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-24 bg-slate-700/50" />
            ))}
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="flex-1 p-8">
          <Skeleton className="h-96 w-full bg-slate-700/50" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            {error || 'Project not found'}
          </h1>
          <Button onClick={() => router.push('/dashboard')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism border-b border-slate-700/50 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-slate-400 hover:text-white flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              
              <div className="h-6 w-px bg-slate-600 mx-1 sm:mx-2 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-semibold text-white truncate">
                {project.name}
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600 hover:text-white text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Save Project</span>
                <span className="sm:hidden">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Tab Navigation */}
      <TabNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (availableTabs.includes(tab)) setActiveTab(tab);
        }}
        availableTabs={availableTabs}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-hidden"
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed Bottom Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50"
      >
        <Button
          onClick={handleAnalyzeProject}
          className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-4 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-lg shadow-2xl transform hover:scale-105 transition-all duration-300"
          disabled={analyzing}
        >
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">{analyzing ? 'Analyzing...' : analysisDone ? 'Re-analyze' : 'Analyze Project'}</span>
            <span className="sm:hidden">{analyzing ? 'Analyzing...' : analysisDone ? 'Re-analyze' : 'Analyze'}</span>
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          
          {/* Glowing animation */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-75 blur-lg animate-pulse -z-10" />
        </Button>
      </motion.div>

      {/* Analysis Progress Modal */}
      <Dialog open={analyzing}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center gap-4">
            <h2 className="text-lg font-bold text-white mb-2">Analyzing Project</h2>
            <div className="w-full flex flex-col gap-4">
              <div className="flex items-center gap-2">
                {progress.dockerfile ? <CheckCircle className="text-green-400 w-5 h-5" /> : <Loader2 className="animate-spin text-blue-400 w-5 h-5" />}
                <span className={progress.dockerfile ? 'text-green-300' : 'text-slate-200'}>Generate Dockerfile</span>
              </div>
              <div className={`flex items-center gap-2 ${progress.dockerfile ? '' : 'opacity-60'}`}>
                {progress.jenkinsfile ? <CheckCircle className="text-green-400 w-5 h-5" /> : <Loader2 className="animate-spin text-blue-400 w-5 h-5" />}
                <span className={progress.jenkinsfile ? 'text-green-300' : 'text-slate-200'}>Generate Jenkinsfile</span>
              </div>
              <div className={`flex items-center gap-2 ${progress.jenkinsfile ? '' : 'opacity-60'}`}>
                {progress.guide ? <CheckCircle className="text-green-400 w-5 h-5" /> : <Loader2 className="animate-spin text-blue-400 w-5 h-5" />}
                <span className={progress.guide ? 'text-green-300' : 'text-slate-200'}>Generate DevOps Guide</span>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-400">This may take a few seconds...</div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper: find file node by path
function findFileNodeByPath(tree: FileNode[], path: string): FileNode | null {
  const parts = path.split('/');
  let nodes = tree;
  let node: FileNode | undefined;
  for (const part of parts) {
    node = nodes.find(n => n.name === part);
    if (!node) return null;
    if (node.type === 'folder') nodes = node.children || [];
  }
  return node || null;
}

// Helper: update file content in tree
function updateFileContentInTree(tree: FileNode[], path: string, newContent: string): FileNode[] {
  const parts = path.split('/');
  return tree.map(node => {
    if (node.name === parts[0]) {
      if (parts.length === 1 && node.type === 'file') {
        return { ...node, content: newContent };
      } else if (node.type === 'folder' && node.children) {
        return { ...node, children: updateFileContentInTree(node.children, parts.slice(1).join('/'), newContent) };
      }
    }
    return node;
  });
}