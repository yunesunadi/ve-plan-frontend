import { inject, Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { RoleType, User } from '../models/User';
import { UserService } from '../services/user.service';

interface Cache {
  current_user$: Observable<User> | null;
  has_role$: Observable<{
    has_role: boolean;
    role: RoleType;
  }> | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardCacheService {
  cache = <Cache>{};

  userService = inject(UserService);

  constructor() { }

  get current_user() {
    if (!this.cache.current_user$) {
      this.cache.current_user$ = this.userService.getCurrentUser().pipe(
        map(res => res.data),
        shareReplay(1)
      );
    }
    return this.cache.current_user$;
  }

  get has_role() {
    if (!this.cache.has_role$) {
      this.cache.has_role$ = this.userService.hasRole().pipe(
        shareReplay(1)
      );
    }
    return this.cache.has_role$;
  }

  resetCurrentUser() {
    this.cache.current_user$ = null;
  }
  
}
