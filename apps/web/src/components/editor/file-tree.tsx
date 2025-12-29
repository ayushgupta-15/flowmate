'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeProps {
  files: FileNode[];
  activeFileId?: string;
  onFileSelect: (fileId: string) => void;
}

export function FileTree({ files, activeFileId, onFileSelect }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-300 text-sm font-semibold">FILES</h3>
      </div>
      <FileTreeNode
        nodes={files}
        level={0}
        expandedFolders={expandedFolders}
        activeFileId={activeFileId}
        onFileSelect={onFileSelect}
        onFolderToggle={toggleFolder}
      />
    </div>
  );
}

function FileTreeNode({
  nodes,
  level,
  expandedFolders,
  activeFileId,
  onFileSelect,
  onFolderToggle,
}: {
  nodes: FileNode[];
  level: number;
  expandedFolders: Set<string>;
  activeFileId?: string;
  onFileSelect: (fileId: string) => void;
  onFolderToggle: (folderId: string) => void;
}) {
  return (
    <div className="space-y-1">
      {nodes.map((node) => {
        const isExpanded = expandedFolders.has(node.id);
        const isActive = activeFileId === node.id;

        return (
          <div key={node.id}>
            <button
              onClick={() => {
                if (node.type === 'folder') {
                  onFolderToggle(node.id);
                } else {
                  onFileSelect(node.id);
                }
              }}
              className={`w-full flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
              type="button"
            >
              {node.type === 'folder' ? (
                <>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <Folder className="w-4 h-4 text-blue-400" />
                </>
              ) : (
                <File className="w-4 h-4 text-gray-400 ml-4" />
              )}
              <span className="truncate">{node.name}</span>
            </button>

            {node.type === 'folder' && isExpanded && node.children && (
              <FileTreeNode
                nodes={node.children}
                level={level + 1}
                expandedFolders={expandedFolders}
                activeFileId={activeFileId}
                onFileSelect={onFileSelect}
                onFolderToggle={onFolderToggle}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
