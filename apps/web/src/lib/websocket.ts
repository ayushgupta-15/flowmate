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
    return () => this.socket?.off(event, cb as any);
  }
}

export const wsClient = new WebSocketClient();
