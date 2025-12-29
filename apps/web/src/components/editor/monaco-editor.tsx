'use client';

import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import { WebsocketProvider } from 'y-websocket';

interface MonacoEditorProps {
  fileId: string;
  sessionId: string;
  language: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export function MonacoEditor({ fileId, sessionId, language, defaultValue, onChange }: MonacoEditorProps) {
  const editorRef = useRef<any>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebsocketProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const provider = new WebsocketProvider(
      process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080',
      `${sessionId}-${fileId}`,
      ydoc
    );
    providerRef.current = provider;

    const ytext = ydoc.getText('monaco');
    const binding = new MonacoBinding(ytext, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
    bindingRef.current = binding;

    return () => {
      binding?.destroy();
      provider?.destroy();
      ydoc?.destroy();
    };
  }, [fileId, sessionId]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  return (
    <Editor
      height="100%"
      language={language}
      defaultValue={defaultValue}
      theme="vs-dark"
      onMount={handleEditorDidMount}
      onChange={(value) => onChange?.(value || '')}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        rulers: [80, 120],
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        tabSize: 2,
      }}
    />
  );
}
