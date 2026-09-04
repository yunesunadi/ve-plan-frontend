import { HttpClient } from '@angular/common/http';
import { ElementRef, inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { AttendeeMeetingResponse, CreateMeetingResponse, CreateTokenResponse, GetMeetingResponse } from '../models/Meeting';
import { GeneralResponse } from '../models/Utils';

declare var JitsiMeetExternalAPI: any;

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private http = inject(HttpClient);

  private apiReady?: Promise<void>;

  constructor() { }

  loadExternalApi(): Promise<void> {
    if (this.apiReady) {
      return this.apiReady;
    }

    this.apiReady = new Promise<void>((resolve, reject) => {
      if (typeof JitsiMeetExternalAPI !== 'undefined' || (window as any).JitsiMeetExternalAPI) {
        resolve();
        return;
      }

      const existing = document.querySelector<HTMLScriptElement>('script[data-veplan-jitsi]');
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => {
          this.apiReady = undefined;
          reject(new Error('Failed to load the 8x8 meeting library.'));
        });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://8x8.vc/${environment.appId}/external_api.js`;
      script.async = true;
      script.dataset['veplanJitsi'] = 'true';
      script.onload = () => resolve();
      script.onerror = () => {
        this.apiReady = undefined;
        reject(new Error('Failed to load the 8x8 meeting library.'));
      };
      document.body.appendChild(script);
    });

    return this.apiReady;
  }

  async createJitsiMeeting(data: { room_name: string; token: string; }, jitsi_iframe: ElementRef, hide_hangup = false) {
    const configOverwrite: any = {
      prejoinPageEnabled: true,
      disableInviteFunctions: true,
      disableKick: true,
    };

    if (hide_hangup) {
      configOverwrite.toolbarButtons = [
        "microphone", "camera", "desktop", "fullscreen", "fodeviceselection",
        "profile", "chat", "settings", "raisehand", "videoquality", "filmstrip",
        "shortcuts", "tileview", "select-background", "mute-everyone",
        "mute-video-everyone", "security",
      ];
    }

    const options = {
      roomName: `${environment.appId}/${data.room_name}`,
      configOverwrite,
      interfaceConfigOverwrite: {
        startAudioMuted: true,
        startVideoMuted: true,
      },
      parentNode: jitsi_iframe.nativeElement,
      jwt: data.token
    };

    await this.loadExternalApi();

    const api = new JitsiMeetExternalAPI(environment.meeting_domain, options);

    return api;
  }

  createToken(eventId: string) {
    const url = `${environment.apiUrl}/meetings/token`;
    return this.http.post<CreateTokenResponse>(url, { event_id: eventId });
  }

  start(event: string) {
    const url = `${environment.apiUrl}/meetings`;
    return this.http.post<CreateMeetingResponse>(url, { event });
  }

  isCreated(event_id: string) {
    const url = `${environment.apiUrl}/meetings/${event_id}/is_created`;
    return this.http.get<GeneralResponse & { is_created: boolean; }>(url);
  }

  isStarted(event_id: string) {
    const url = `${environment.apiUrl}/meetings/${event_id}/is_started`;
    return this.http.get<GeneralResponse & { is_started: boolean; }>(url);
  }

  getOneById(event_id: string) {
    const url = `${environment.apiUrl}/meetings/${event_id}`;
    return this.http.get<GetMeetingResponse>(url);
  }

  getOneByEventId(event_id: string) {
    const url = `${environment.apiUrl}/meetings/${event_id}/attendee`;
    return this.http.get<AttendeeMeetingResponse>(url);
  }

  updateStartTime(event_id: string) {
    const url = `${environment.apiUrl}/meetings/${event_id}/start_time`;
    return this.http.put<GeneralResponse>(url, {});
  }

  updateEndTime(event_id: string) {
    const url = `${environment.apiUrl}/meetings/${event_id}/end_time`;
    return this.http.put<GeneralResponse>(url, {});
  }

  end(event_id: string) {
    const url = `${environment.apiUrl}/meetings/${event_id}/end`;
    return this.http.put<GeneralResponse>(url, {});
  }

  reopen(event_id: string) {
    const url = `${environment.apiUrl}/meetings/${event_id}/reopen`;
    return this.http.put<GeneralResponse>(url, {});
  }

}
