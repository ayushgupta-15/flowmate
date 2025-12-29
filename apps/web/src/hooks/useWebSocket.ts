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
