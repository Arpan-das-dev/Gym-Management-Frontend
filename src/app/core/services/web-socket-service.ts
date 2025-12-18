import { Injectable } from '@angular/core';
import { Client , IMessage} from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Authservice } from './authservice';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  constructor(private auth : Authservice){}
  private stompClient!: Client;
  private connected = false;
  private subscriptionQueue: { topic: string, callback: (msg: number) => void }[] = [];

  
  connect(wsUrl: string): void {
    if (this.connected) return;
    const token  =this.auth.getToken()
    console.log("connected");
    this.stompClient = new Client({
      brokerURL: wsUrl, // e.g., ws://localhost:8080/ws
      reconnectDelay: 5000,
      
      // connectHeaders:{
      //   Authorization: `Bearer ${token}`
      // },
      debug: () => {}
    });

    this.stompClient.onConnect = () => {
      console.log('WebSocket connected:', wsUrl);
      this.connected = true;

      if (!this.stompClient || !this.stompClient.active) {
         console.warn('STOMP client is not active right after connect. Aborting subscription queue.');
         return; // Exit if the connection is immediately lost
      }
      // Subscribe queued topics
      this.subscriptionQueue.forEach(sub => {
        this.stompClient.subscribe(sub.topic, (message: IMessage) => {
          sub.callback(Number(message.body));
          console.log("the websoket message is::+>", message);
          
        });
      });
      this.subscriptionQueue = [];
    };

    this.stompClient.onStompError = (err) => {
      console.error('WebSocket Error:', err);
    };

    this.stompClient.activate();
  }

  subscribe(topic: string, callback: (msg: number) => void) {
    if (this.connected) {
      this.stompClient.subscribe(topic, (message: IMessage) => {
        callback(Number(message.body));
      });
    } else {
      // Queue until connected
      this.subscriptionQueue.push({ topic, callback });
    }
  }

  disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.connected = false;
    }
  }

  ngOnDestroy() {
    this.disconnect();
  }
}

