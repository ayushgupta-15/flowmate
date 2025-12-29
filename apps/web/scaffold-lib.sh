#!/bin/bash
set -e

echo "🚀 Scaffolding FlowMate frontend lib, hooks, and types..."

# =========================
# Directories
# =========================
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types

# =========================
# api-client.ts
# =========================
cat > src/lib/api-client.ts << 'EOL'
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_URL}/api/v1`,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('access_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  login(email: string, password: string) {
    return this.client.post('/auth/login', { email, password });
  }

  getCurrentUser() {
    return this.client.get('/auth/me');
  }

  getProjects() {
    return this.client.get('/projects');
  }
}

export const apiClient = new ApiClient();
EOL

# =========================
# websocket.ts
# =========================
cat > src/lib/websocket.ts << 'EOL'
import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

class WebSocketClient {
  private socket: Socket | null = null;

  connect(sessionId: string, token: string) {
    if (this.socket) return;
    this.socket = io(WS_URL, {
      auth: { token },
      query: { sessionId },
      transports: ['websocket'],
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, payload: any) {
    this.socket?.emit(event, payload);
  }

  on(event: string, cb: Function) {
    this.socket?.on(event, cb as any);
  }
}

export const wsClient = new WebSocketClient();
EOL

# =========================
# yjs-provider.ts
# =========================
cat > src/lib/yjs-provider.ts << 'EOL'
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export class CollaborativeEditor {
  ydoc = new Y.Doc();
  ytext = this.ydoc.getText('monaco');
  provider: WebsocketProvider;

  constructor(documentId: string, token: string) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
    this.provider = new WebsocketProvider(wsUrl, documentId, this.ydoc, {
      params: { token },
    });
  }

  destroy() {
    this.provider.destroy();
    this.ydoc.destroy();
  }
}
EOL

# =========================
# useWebSocket.ts
# =========================
cat > src/hooks/useWebSocket.ts << 'EOL'
import { useEffect } from 'react';
import { wsClient } from '@/lib/websocket';

export function useWebSocket(sessionId: string) {
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !sessionId) return;

    wsClient.connect(sessionId, token);
    return () => wsClient.disconnect();
  }, [sessionId]);
}
EOL

# =========================
# useAuth.ts
# =========================
cat > src/hooks/useAuth.ts << 'EOL'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getCurrentUser()
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.clear();
    setUser(null);
    router.push('/auth/login');
  };

  return { user, loading, logout, isAuthenticated: !!user };
}
EOL

# =========================
# types/index.ts
# =========================
cat > src/types/index.ts << 'EOL'
export interface Project {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Session {
  id: string;
  project_id: string;
  name: string;
  status: 'active' | 'ended';
}
EOL

echo "✅ FlowMate lib + hooks + types created successfully"
