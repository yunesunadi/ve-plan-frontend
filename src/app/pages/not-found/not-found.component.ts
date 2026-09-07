import { Component, ChangeDetectionStrategy, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { jwtDecode } from 'jwt-decode';
import { UserPayload } from '../../models/User';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrl: './not-found.component.scss',
    imports: [RouterLink, MatButton, MatIcon]
})
export class NotFoundComponent {
  private readonly role = computed(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      return jwtDecode<UserPayload>(token).role ?? null;
    } catch {
      return null;
    }
  });

  readonly homeLink = computed(() =>
    this.role() ? `/${this.role()}/dashboard/home` : '/login'
  );

  readonly homeLabel = computed(() => (this.role() ? 'Go to dashboard' : 'Go to log in'));
}
