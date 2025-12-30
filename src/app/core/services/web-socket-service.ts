import { Injectable } from '@angular/core';
import { Client , IMessage} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Authservice } from './authservice';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private clients = new Map<string, Client>();
  private subscriptions = new Map<
    string,
    { topic: string; callback: (msg: number) => void }[]
  >();

  connect(key: string, wsUrl: string): void {
    if (this.clients.has(key)) return;

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 5000,
      debug: () => {}
    });

    client.onConnect = () => {
      console.log(`✅ WS connected [${key}] → ${wsUrl}`);

      // 🔥 flush queued subscriptions
      const queued = this.subscriptions.get(key) || [];
      queued.forEach(sub => {
        client.subscribe(sub.topic, msg => {
          sub.callback(Number(msg.body));
        });
      });

      this.subscriptions.delete(key);
    };

    client.onStompError = err => {
      console.error(`❌ STOMP error [${key}]`, err);
    };

    client.activate();
    this.clients.set(key, client);
  }

  subscribe(
    key: string,
    topic: string,
    callback: (msg: number) => void
  ): void {
    const client = this.clients.get(key);

    // ⏳ Not connected yet → queue it
    if (!client || !client.connected) {
      const existing = this.subscriptions.get(key) || [];
      existing.push({ topic, callback });
      this.subscriptions.set(key, existing);
      return;
    }

    // ✅ Already connected
    client.subscribe(topic, msg => {
      callback(Number(msg.body));
    });
  }

  disconnect(key: string): void {
    const client = this.clients.get(key);
    if (client) {
      client.deactivate();
      this.clients.delete(key);
      this.subscriptions.delete(key);
    }
  }

  disconnectAll(): void {
    this.clients.forEach(client => client.deactivate());
    this.clients.clear();
    this.subscriptions.clear();
  }

  ngOnDestroy(): void {
    this.disconnectAll();
  }
}