import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket, io } from "socket.io-client";
import { environment } from '../../environments/environment';
import { Notification } from '../models/Notification';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | undefined;

  constructor() { }

  connect(token: string) {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }
    
    this.socket = io(environment.socketUrl, {
      auth: { token }
    });

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = undefined;
    console.log('Socket disconnected');
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  onNotification(): Observable<Notification> {
    return new Observable(observer => {
      if (!this.socket) {
        observer.error(new Error('Socket not connected'));
        return;
      }

      this.socket.on("notification", (data: Notification) => {
        observer.next(data);
      });

      return () => {
        this.socket?.off("notification", (data: Notification) => {
          observer.next(data);
        });
      };
    });
  }
}
