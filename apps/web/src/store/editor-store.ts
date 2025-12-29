import { create } from 'zustand';

interface EditorState {
  activeFileId: string | null;
  openFiles: string[];
  fileContents: Map<string, string>;
  setActiveFile: (fileId: string) => void;
  openFile: (fileId: string) => void;
  closeFile: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  activeFileId: null,
  openFiles: [],
  fileContents: new Map(),
  setActiveFile: (fileId) => set({ activeFileId: fileId }),
  openFile: (fileId) =>
    set((state) => ({
      openFiles: state.openFiles.includes(fileId) ? state.openFiles : [...state.openFiles, fileId],
      activeFileId: fileId,
    })),
  closeFile: (fileId) =>
    set((state) => ({
      openFiles: state.openFiles.filter((id) => id !== fileId),
      activeFileId: state.activeFileId === fileId ? state.openFiles[0] || null : state.activeFileId,
    })),
  updateFileContent: (fileId, content) =>
    set((state) => ({
      fileContents: new Map(state.fileContents).set(fileId, content),
    })),
}));
