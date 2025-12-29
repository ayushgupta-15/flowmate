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
