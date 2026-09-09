import { ChangeDetectionStrategy, Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmailStatus, EventEmailAction } from '../../models/Email';
import { CommonService } from '../../services/common.service';
import { EmailService } from '../../services/email.service';

const ACTION_LABEL: Record<EventEmailAction, string> = {
  invitation_sent: 'Invitation emails',
  register_approved: 'Approval emails',
  meeting_started: 'Meeting notification emails',
};

@Component({
  selector: 'app-email-delivery-status',
  templateUrl: './email-delivery-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './email-delivery-status.component.scss',
  imports: [MatCard, MatCardContent, MatButton, MatIcon, MatProgressSpinner]
})
export class EmailDeliveryStatusComponent implements OnInit {
  @Input({ required: true }) eventId!: string;
  @Input() action?: EventEmailAction;

  private emailService = inject(EmailService);
  private commonService = inject(CommonService);

  readonly status = signal<EmailStatus | null>(null);
  readonly loading = signal(false);
  readonly retrying = signal(false);

  get heading(): string {
    return this.action ? ACTION_LABEL[this.action] : 'Email delivery';
  }

  readonly visibleStatus = computed<EmailStatus | null>(() => {
    const s = this.status();
    if (!s) return null;
    return (s.sent + s.pending + s.failed) > 0 ? s : null;
  });

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    if (!this.eventId) return;
    this.loading.set(true);
    this.emailService.getStatus(this.eventId, this.action).subscribe({
      next: (res) => {
        this.status.set(res.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  retryFailed(): void {
    if (this.retrying()) return;
    this.retrying.set(true);
    this.emailService.retry(this.eventId, this.action).subscribe({
      next: (res) => {
        this.retrying.set(false);
        const requeued = res.data?.requeued ?? 0;
        this.commonService.success(`Re-queued ${requeued} email(s).`);
        this.refresh();
      },
      error: () => {
        this.retrying.set(false);
        this.commonService.error('Failed to retry emails.');
      }
    });
  }
}
