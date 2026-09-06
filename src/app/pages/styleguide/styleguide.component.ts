import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatInput, MatError } from '@angular/material/input';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatTableDataSource,
} from '@angular/material/table';

import { ApiError } from '../../models/ApiError';
import { Event } from '../../models/Event';
import { User } from '../../models/User';
import { Breadcrumb } from '../../models/Breadcrumb';
import { CommonService } from '../../services/common.service';
import { ConfirmService } from '../../services/confirm.service';
import { OutletInnerComponent } from '../../shared/outlet-inner/outlet-inner.component';

import { AvatarComponent, AvatarSize } from '../../shared/ui/avatar/avatar.component';
import { StatusChipComponent, STATUS_META, StatusKind } from '../../shared/ui/status-chip/status-chip.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../shared/ui/error-state/error-state.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';
import { BreadcrumbsComponent } from '../../shared/ui/breadcrumbs/breadcrumbs.component';
import { EventCardComponent } from '../../shared/ui/event-card/event-card.component';
import { DataTableComponent } from '../../shared/ui/data-table/data-table.component';
import { FormErrorComponent } from '../../shared/ui/form-error/form-error.component';
import { SubmitButtonComponent } from '../../shared/ui/submit-button/submit-button.component';

import { contrastForVarPair, formatRatio, meetsAA } from './contrast.util';

interface ColorRole {
  name: string;
  containerVar: string;
  onVar: string;
  large?: boolean;
}

interface ContrastRow extends ColorRole {
  ratio: number | null;
}

interface SpacingToken {
  name: string;
  varName: string;
  px: string;
}

interface SampleTableRow {
  id: string;
  name: string;
  status: Extract<StatusKind, 'registered' | 'register_approved' | 'invited'>;
}

type TableDemoState = 'table' | 'loading' | 'error' | 'empty';

const COLOR_ROLES: ColorRole[] = [
  { name: 'Primary', containerVar: '--mat-sys-primary', onVar: '--mat-sys-on-primary' },
  { name: 'Primary container', containerVar: '--mat-sys-primary-container', onVar: '--mat-sys-on-primary-container' },
  { name: 'Secondary', containerVar: '--mat-sys-secondary', onVar: '--mat-sys-on-secondary' },
  { name: 'Secondary container', containerVar: '--mat-sys-secondary-container', onVar: '--mat-sys-on-secondary-container' },
  { name: 'Tertiary', containerVar: '--mat-sys-tertiary', onVar: '--mat-sys-on-tertiary' },
  { name: 'Tertiary container', containerVar: '--mat-sys-tertiary-container', onVar: '--mat-sys-on-tertiary-container' },
  { name: 'Error', containerVar: '--mat-sys-error', onVar: '--mat-sys-on-error' },
  { name: 'Error container', containerVar: '--mat-sys-error-container', onVar: '--mat-sys-on-error-container' },
  { name: 'Surface', containerVar: '--mat-sys-surface', onVar: '--mat-sys-on-surface' },
  { name: 'Surface variant', containerVar: '--mat-sys-surface-variant', onVar: '--mat-sys-on-surface-variant' },
  { name: 'Inverse surface', containerVar: '--mat-sys-inverse-surface', onVar: '--mat-sys-inverse-on-surface' },
  { name: 'Background', containerVar: '--mat-sys-background', onVar: '--mat-sys-on-background' },
];

const STATUS_TONE_ROLES: ColorRole[] = [
  { name: 'Success', containerVar: '--app-status-success-container', onVar: '--app-status-success-on-container' },
  { name: 'Warning', containerVar: '--app-status-warning-container', onVar: '--app-status-warning-on-container' },
  { name: 'Info', containerVar: '--app-status-info-container', onVar: '--app-status-info-on-container' },
  { name: 'Neutral', containerVar: '--app-status-neutral-container', onVar: '--app-status-neutral-on-container' },
];

const SPACING_SCALE: SpacingToken[] = [
  { name: 'space-1', varName: '--app-space-1', px: '4px' },
  { name: 'space-2', varName: '--app-space-2', px: '8px' },
  { name: 'space-3', varName: '--app-space-3', px: '12px' },
  { name: 'space-4', varName: '--app-space-4', px: '16px' },
  { name: 'space-5', varName: '--app-space-5', px: '24px' },
  { name: 'space-6', varName: '--app-space-6', px: '32px' },
  { name: 'space-7', varName: '--app-space-7', px: '48px' },
];

const RADIUS_SCALE: SpacingToken[] = [
  { name: 'radius-xs', varName: '--app-radius-xs', px: '4px' },
  { name: 'radius-sm', varName: '--app-radius-sm', px: '8px' },
  { name: 'radius-md', varName: '--app-radius-md', px: '12px' },
  { name: 'radius-lg', varName: '--app-radius-lg', px: '16px' },
  { name: 'radius-full', varName: '--app-radius-full', px: '9999px' },
];

const ELEVATION_SCALE = ['--app-elev-0', '--app-elev-1', '--app-elev-2', '--app-elev-3', '--app-elev-4', '--app-elev-5'];

const MOTION_SCALE: SpacingToken[] = [
  { name: 'motion-fast', varName: '--app-motion-fast', px: '120ms' },
  { name: 'motion-base', varName: '--app-motion-base', px: '200ms' },
  { name: 'motion-slow', varName: '--app-motion-slow', px: '320ms' },
];

const TYPE_SCALE = [
  'display-large', 'display-medium', 'display-small',
  'headline-large', 'headline-medium', 'headline-small',
  'title-large', 'title-medium', 'title-small',
  'body-large', 'body-medium', 'body-small',
  'label-large', 'label-medium', 'label-small',
];

const ALL_STATUS_KINDS = Object.keys(STATUS_META) as StatusKind[];

const SAMPLE_ORGANIZER: User = {
  _id: 'user-organizer-1',
  name: 'Maya Chen',
  email: 'maya.chen@example.com',
  role: 'organizer',
  isVerified: true,
};

const SAMPLE_EVENT_WITH_COVER: Event = {
  _id: 'evt-with-cover',
  cover: 'sample-cover.jpg',
  title: 'Design Systems at Scale',
  description: 'A deep dive into building and governing a shared component library across product teams.',
  date: new Date().toISOString(),
  start_time: new Date().toISOString(),
  end_time: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  timezone: 'America/New_York',
  starts_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
  ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
  category: 'conference',
  type: 'public',
  user: SAMPLE_ORGANIZER,
  participation: { state: 'registered', meeting_started: false },
};

const SAMPLE_EVENT_NO_COVER: Event = {
  ...SAMPLE_EVENT_WITH_COVER,
  _id: 'evt-no-cover',
  cover: '',
  title: 'Weekly Product Sync',
  description: 'Async-friendly standup covering shipped work, blockers, and next week’s priorities.',
  category: 'meetup',
  type: 'private',
  participation: { state: 'invitation_accepted', meeting_started: false },
};

const SAMPLE_TABLE_ROWS: SampleTableRow[] = [
  { id: '1', name: 'Ava Thompson', status: 'register_approved' },
  { id: '2', name: 'Noah Patel', status: 'registered' },
  { id: '3', name: 'Sofia Ramirez', status: 'invited' },
  { id: '4', name: 'Liam Okafor', status: 'register_approved' },
  { id: '5', name: 'Grace Kim', status: 'registered' },
];

@Component({
  selector: 'app-styleguide',
  templateUrl: './styleguide.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './styleguide.component.scss',
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    OutletInnerComponent,
    AvatarComponent,
    StatusChipComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    SkeletonComponent,
    PageHeaderComponent,
    BreadcrumbsComponent,
    EventCardComponent,
    DataTableComponent,
    FormErrorComponent,
    SubmitButtonComponent,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
  ],
})
export class StyleguideComponent implements OnInit {
  private readonly commonService = inject(CommonService);
  private readonly confirmService = inject(ConfirmService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly colorRoles = signal<ContrastRow[]>(COLOR_ROLES.map((role) => ({ ...role, ratio: null })));
  protected readonly statusToneRoles = signal<ContrastRow[]>(STATUS_TONE_ROLES.map((role) => ({ ...role, ratio: null })));

  protected readonly spacingScale = SPACING_SCALE;
  protected readonly radiusScale = RADIUS_SCALE;
  protected readonly elevationScale = ELEVATION_SCALE;
  protected readonly motionScale = MOTION_SCALE;
  protected readonly typeScale = TYPE_SCALE;
  protected readonly statusKinds = ALL_STATUS_KINDS;

  protected readonly avatarSizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg'];

  protected readonly sampleUserWithPhoto: User = { ...SAMPLE_ORGANIZER, profile: 'nonexistent-upload.jpg' };
  protected readonly sampleUserOneWord: User = { ...SAMPLE_ORGANIZER, _id: 'user-2', name: 'Zephyr' };
  protected readonly sampleUserNoPhoto: User = { ...SAMPLE_ORGANIZER, _id: 'user-3', profile: undefined };

  protected readonly eventWithCover = SAMPLE_EVENT_WITH_COVER;
  protected readonly eventNoCover = SAMPLE_EVENT_NO_COVER;

  protected readonly sampleCrumbs: Breadcrumb[] = [
    { label: 'Events', link: '/organizer/dashboard/events' },
    { label: 'Design Systems at Scale', link: ['/organizer/dashboard/events', 'evt-with-cover', 'view'] },
    { label: 'Registered users' },
  ];

  // --- error-state gallery -------------------------------------------------
  protected readonly errorSamples: { label: string; error: ApiError }[] = [
    { label: 'Network (status 0)', error: this.buildError(0) },
    { label: 'Validation (400, user-actionable)', error: this.buildError(400, 'That event title is already taken.') },
    { label: 'Forbidden (403)', error: this.buildError(403) },
    { label: 'Not found (404)', error: this.buildError(404) },
    { label: 'Server (500, with requestId)', error: this.buildError(500, undefined, { requestId: 'req-8f21ac' }) },
  ];

  // --- data-table demo ------------------------------------------------------
  protected readonly tableDemoState = signal<TableDemoState>('table');
  protected readonly tableDataSource = new MatTableDataSource<SampleTableRow>(SAMPLE_TABLE_ROWS);
  protected readonly tableColumns = ['name', 'status'];
  protected readonly tableSelection = signal<SampleTableRow[]>([]);

  protected readonly tableLoading = () => this.tableDemoState() === 'loading';
  protected readonly tableError = () =>
    this.tableDemoState() === 'error' ? this.buildError(500, undefined, { requestId: 'req-styleguide' }) : null;
  protected readonly tableRows = () => (this.tableDemoState() === 'empty' ? [] : SAMPLE_TABLE_ROWS);

  // --- form demo --------------------------------------------------------------
  protected readonly demoForm = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly formSubmitting = signal(false);

  get nameControl() {
    return this.demoForm.controls.name;
  }

  get emailControl() {
    return this.demoForm.controls.email;
  }

  ngOnInit(): void {
    this.colorRoles.set(COLOR_ROLES.map((role) => ({ ...role, ratio: contrastForVarPair(role.containerVar, role.onVar) })));
    this.statusToneRoles.set(
      STATUS_TONE_ROLES.map((role) => ({ ...role, ratio: contrastForVarPair(role.containerVar, role.onVar) })),
    );
  }

  protected formatRatio = formatRatio;
  protected meetsAA = meetsAA;

  protected setTableState(state: TableDemoState): void {
    this.tableDemoState.set(state);
  }

  protected onTableRetry(): void {
    this.commonService.info('Table retry requested — resetting the demo to its loaded state.');
    this.tableDemoState.set('table');
  }

  protected triggerToast(severity: 'success' | 'info' | 'warning'): void {
    this.commonService[severity](`This is a ${severity} toast, styled by CommonService.`);
  }

  protected triggerErrorToast(): void {
    this.commonService.error(this.buildError(500, undefined, { requestId: 'req-toast-demo' }));
  }

  protected triggerConfirm(): void {
    this.confirmService
      .confirm({ title: 'Publish this event?', body: 'Attendees will be able to see and register immediately.' })
      .subscribe((confirmed) => this.commonService.info(confirmed ? 'Confirmed.' : 'Cancelled.'));
  }

  protected triggerDestructiveConfirm(): void {
    this.confirmService
      .confirm({
        title: 'Delete this event?',
        body: 'This permanently removes the event, its sessions, and every registration. This cannot be undone.',
        confirmLabel: 'Delete event',
        destructive: true,
        confirmationPhrase: 'Design Systems at Scale',
        confirmationHint: 'Type the event title to confirm',
      })
      .subscribe((confirmed) => this.commonService.info(confirmed ? 'Deleted (demo only).' : 'Cancelled.'));
  }

  protected triggerAcknowledge(): void {
    this.confirmService.acknowledge('Meeting ended', 'The host has ended this meeting for all participants.').subscribe();
  }

  protected submitDemoForm(): void {
    this.demoForm.markAllAsTouched();
    if (this.demoForm.invalid) return;

    this.formSubmitting.set(true);
    setTimeout(() => {
      this.formSubmitting.set(false);
      this.commonService.success('Demo form submitted.');
    }, 900);
  }

  private buildError(status: number, message?: string, data?: unknown): ApiError {
    return new ApiError(
      new HttpErrorResponse({
        status,
        error: message || data ? { status: 'error', message, data } : undefined,
      }),
    );
  }
}
