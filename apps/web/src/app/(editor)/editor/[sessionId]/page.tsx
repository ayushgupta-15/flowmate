'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Code2, FileText, FolderOpen, Play, Plus, Sparkles } from 'lucide-react';
import { FileTree, type FileNode } from '@/components/editor/file-tree';
import { Terminal } from '@/components/editor/terminal';
import { AIChat } from '@/components/ai/ai-chat';
import { useRequireAuth } from '@/hooks/use-auth';

export default function EditorPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter();
  useRequireAuth('/login');
  const [activeFile, setActiveFile] = useState('app.js');
  const [showAI, setShowAI] = useState(false);
  const [showTerminal, setShowTerminal] = useState(true);

  const files: FileNode[] = [
    {
      name: 'src',
      id: 'src',
      type: 'folder',
      children: [
        { name: 'app.js', id: 'app.js', type: 'file' },
        { name: 'index.html', id: 'index.html', type: 'file' },
        { name: 'styles.css', id: 'styles.css', type: 'file' },
      ],
    },
    { name: 'package.json', id: 'package.json', type: 'file' },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-white hover:text-blue-400" type="button">
            <Code2 className="w-5 h-5" />
            <span className="font-semibold">FlowMate</span>
          </button>
          <div className="text-gray-400 text-sm truncate">Session: {params.sessionId}</div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded" type="button">
            Share
          </button>
          <button className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm" type="button">
            <Play className="w-4 h-4" />
            Run
          </button>
          <div className="flex items-center gap-2 ml-4">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 bg-blue-500 rounded-full border-2 border-gray-800" />
              <div className="w-7 h-7 bg-purple-500 rounded-full border-2 border-gray-800" />
              <div className="w-7 h-7 bg-green-500 rounded-full border-2 border-gray-800" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-300 text-sm font-semibold">FILES</h3>
              <button className="text-gray-400 hover:text-white" type="button">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <FileTree files={files} activeFileId={activeFile} onFileSelect={setActiveFile} />
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center px-4 gap-2">
            <div className="px-3 py-1 bg-gray-700 rounded text-gray-300 text-sm">{activeFile}</div>
          </div>
          <div className="flex-1 bg-gray-900 p-4 font-mono text-sm text-gray-300 overflow-auto">
            <pre className="text-green-400">
{`import React from 'react';
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <div className="app">
      <h1>Counter: {count}</h1>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

export default App;`}
            </pre>
          </div>
        </div>

        {showAI && (
          <div className="w-96 bg-gray-800 border-l border-gray-700">
            <AIChat />
          </div>
        )}
      </div>

      {showTerminal && (
        <div className="h-48 bg-gray-900 border-t border-gray-700">
          <Terminal />
        </div>
      )}

      <button
        onClick={() => setShowAI((prev) => !prev)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50"
        type="button"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>
    </div>
  );
}
