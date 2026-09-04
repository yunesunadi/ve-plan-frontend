import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { Socket, io } from "socket.io-client";
import { environment } from '../../environments/environment';
import { Notification } from '../models/Notification';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | undefined;
  private currentToken: string | undefined;
  private router = inject(Router);

  private notifications = new Subject<Notification>();
  private connected = new BehaviorSubject<boolean>(false);

  constructor() { }

  connect(token: string) {
    // Token-aware, single-instance guard: a repeat connect with the same token
    // is a no-op; a different token (e.g. a fresh one after a password change,
    // which the server has already used to drop the old socket) tears the old
    // connection down first so we don't leak a second io() instance or
    // auto-reconnect with a now-invalid token (H-NOT-11).
    if (this.socket && this.currentToken === token) {
      return;
    }
    if (this.socket) {
      this.disconnect();
    }

    this.currentToken = token;
    this.socket = io(environment.socketUrl, {
      path: environment.socketPath,
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    this.socket.on("connect", () => {
      console.log("Socket connected successfully");
      this.connected.next(true);
    });

    this.socket.on("disconnect", () => {
      this.connected.next(false);
    });

    this.socket.on("notification", (data: Notification) => {
      this.notifications.next(data);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);

      if (error?.message?.includes("Authentication")) {
        this.disconnect();
        localStorage.removeItem("token");
        this.router.navigateByUrl("login");
      }
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = undefined;
    this.currentToken = undefined;
    this.connected.next(false);
    console.log('Socket disconnected');
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  connected$(): Observable<boolean> {
    return this.connected.asObservable();
  }

  onNotification(): Observable<Notification> {
    return this.notifications.asObservable();
  }
}
