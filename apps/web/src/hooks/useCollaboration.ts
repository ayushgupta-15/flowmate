import { useEffect, useState } from 'react';
import { wsClient } from '@/lib/websocket';

type CursorPosition = { line: number; column: number };
type CollaborationUser = { id: string; name: string; color?: string };

export function useCollaboration(sessionId: string) {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [cursors, setCursors] = useState<Map<string, CursorPosition>>(new Map());

  useEffect(() => {
    const unsubJoin = wsClient.on('user:joined', (data: { user: CollaborationUser }) => {
      setUsers((prev) => [...prev, data.user]);
    });

    const unsubLeave = wsClient.on('user:left', (data: { userId: string }) => {
      setUsers((prev) => prev.filter((u) => u.id !== data.userId));
    });

    const unsubCursor = wsClient.on('cursor:update', (data: { userId: string; position: CursorPosition }) => {
      setCursors((prev) => {
        const next = new Map(prev);
        next.set(data.userId, data.position);
        return next;
      });
    });

    return () => {
      unsubJoin?.();
      unsubLeave?.();
      unsubCursor?.();
    };
  }, [sessionId]);

  return { users, cursors };
}
