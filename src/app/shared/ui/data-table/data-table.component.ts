import { NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  DestroyRef,
  ElementRef,
  QueryList,
  TemplateRef,
  ViewChild,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { SelectionModel } from '@angular/cdk/collections';
import { MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatFormField, MatInput, MatLabel, MatPrefix, MatSuffix } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { ApiError } from '../../../models/ApiError';
import { LayoutService } from '../../../services/layout.service';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ErrorStateComponent } from '../error-state/error-state.component';
import { SkeletonComponent } from '../skeleton/skeleton.component';

export type DataTableState = 'loading' | 'error' | 'empty' | 'no-results' | 'table';

const SEARCH_DEBOUNCE_MS = 300;
const SELECT_COLUMN = '__select';

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './data-table.component.scss',
  imports: [
    NgTemplateOutlet,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    MatCheckbox,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatSuffix,
    MatInput,
    MatIconButton,
    MatIcon,
    SkeletonComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
})
export class DataTableComponent<T> implements AfterContentInit, AfterViewChecked {
  private readonly layout = inject(LayoutService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly isCompact = this.layout.isCompact;

  protected readonly focusedIndex = signal(0);

  // data
  dataSource = input.required<MatTableDataSource<T> | T[]>();
  columns = input.required<string[]>();
  trackBy = input<(index: number, row: T) => unknown>();

  // state
  loading = input<boolean>(false);
  error = input<ApiError | null>(null);

  searchLabel = input<string>('Search');
  searchPlaceholder = input<string>('');
  searchValue = model<string>('');
  serverSearch = input<boolean, unknown>(false, { transform: booleanAttribute });

  // selection
  selectable = input<boolean, unknown>(false, { transform: booleanAttribute });
  isRowSelectable = input<(row: T) => boolean>(() => true);
  selection = model<T[]>([]);

  // pagination (server-side)
  total = input<number>(0);
  pageSize = input<number>(5);
  pageIndex = input<number>(0);

  // empty state passthrough
  emptyIcon = input<string>('inbox');
  emptyHeadline = input<string>('Nothing here yet');
  emptySupporting = input<string>('');

  // outputs
  pageChange = output<PageEvent>();
  retry = output<void>();
  rowActivate = output<T>();

  @ContentChild('cardRow') protected cardRowTemplate?: TemplateRef<{ $implicit: T }>;
  @ContentChildren(MatColumnDef) private projectedColumnDefs!: QueryList<MatColumnDef>;
  @ViewChild(MatTable) private matTable?: MatTable<T>;

  private lastSyncedTable?: MatTable<T>;
  private readonly registeredColumnDefs = new Set<MatColumnDef>();

  private readonly columnDefsRegistered = signal(false);

  protected readonly selectionModel = new SelectionModel<T>(true, []);
  private lastPushedSelection: T[] | null = null;
  private lastAppliedSearchValue = this.searchValue();

  protected readonly searchDraft = signal(this.searchValue());

  protected readonly effectiveColumns = computed(() => {
    if (!this.columnDefsRegistered()) return [];
    return this.selectable() ? [SELECT_COLUMN, ...this.columns()] : this.columns();
  });

  private readonly baseRows = computed<T[]>(() => {
    const ds = this.dataSource();
    return ds instanceof MatTableDataSource ? ds.data : ds;
  });

  protected readonly rows = computed<T[]>(() => {
    const base = this.baseRows();
    if (this.serverSearch()) return base;

    const term = this.searchValue().trim().toLowerCase();
    if (!term) return base;
    return base.filter((row) => JSON.stringify(row).toLowerCase().includes(term));
  });

  protected readonly selectableRows = computed(() => this.rows().filter((row) => this.isRowSelectable()(row)));

  protected readonly allSelected = computed(() => {
    const selectable = this.selectableRows();
    if (selectable.length === 0) return false;
    const selected = this.selection();
    return selectable.every((row) => selected.includes(row));
  });

  protected readonly state = computed<DataTableState>(() => {
    if (this.loading()) return 'loading';
    if (this.error()) return 'error';
    if (this.rows().length === 0) {
      return this.searchValue().trim() ? 'no-results' : 'empty';
    }
    return 'table';
  });

  constructor() {
    effect(() => {
      const next = this.selection();
      if (next === this.lastPushedSelection) return;
      this.selectionModel.clear();
      if (next.length) this.selectionModel.select(...next);
    });

    effect(() => {
      const value = this.searchValue();
      if (value === this.lastAppliedSearchValue) return;
      this.lastAppliedSearchValue = value;
      this.searchDraft.set(value);
    });

    toObservable(this.searchDraft)
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.lastAppliedSearchValue = value;
        this.searchValue.set(value);
      });

    effect(() => {
      this.rows();
      this.focusedIndex.set(0);
    });
  }

  ngAfterContentInit(): void {
    this.projectedColumnDefs.changes.subscribe(() => this.syncColumnDefs());
  }

  ngAfterViewChecked(): void {
    this.syncColumnDefs();
  }

  private syncColumnDefs(): void {
    const table = this.matTable;

    if (table !== this.lastSyncedTable) {
      this.registeredColumnDefs.clear();
      this.lastSyncedTable = table;
      this.columnDefsRegistered.set(false);
    }

    if (!table) return;

    const current = new Set(this.projectedColumnDefs.toArray());

    for (const def of this.registeredColumnDefs) {
      if (!current.has(def)) {
        table.removeColumnDef(def);
        this.registeredColumnDefs.delete(def);
      }
    }

    for (const def of current) {
      if (!this.registeredColumnDefs.has(def)) {
        table.addColumnDef(def);
        this.registeredColumnDefs.add(def);
      }
    }

    this.columnDefsRegistered.set(this.registeredColumnDefs.size > 0);
  }

  protected onSearchInput(event: Event): void {
    this.searchDraft.set((event.target as HTMLInputElement).value);
  }

  protected clearSearch(): void {
    this.searchDraft.set('');
    this.lastAppliedSearchValue = '';
    this.searchValue.set('');
  }

  protected toggleRow(row: T): void {
    if (this.selectable() && !this.isRowSelectable()(row)) return;
    this.selectionModel.toggle(row);
    this.pushSelection();
  }

  protected toggleAllRows(): void {
    const selectable = this.selectableRows();
    if (this.allSelected()) {
      this.selectionModel.deselect(...selectable);
    } else {
      this.selectionModel.select(...selectable);
    }
    this.pushSelection();
  }

  protected isSelected(row: T): boolean {
    return this.selection().includes(row);
  }

  protected onRowActivate(row: T): void {
    if (this.selectable()) {
      this.toggleRow(row);
    } else {
      this.rowActivate.emit(row);
    }
  }

  protected onRowKeydown(event: KeyboardEvent, row: T, index: number): void {
    switch (event.key) {
      case ' ':
      case 'Spacebar':
        event.preventDefault();
        this.onRowActivate(row);
        break;
      case 'Enter':
        this.onRowActivate(row);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.moveFocus(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveFocus(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        this.moveFocus(0);
        break;
      case 'End':
        event.preventDefault();
        this.moveFocus(this.rows().length - 1);
        break;
    }
  }

  private moveFocus(to: number): void {
    const max = this.rows().length - 1;
    if (max < 0) return;
    const next = Math.max(0, Math.min(max, to));
    this.focusedIndex.set(next);
    this.host.nativeElement
      .querySelector<HTMLElement>(`[data-row-index="${next}"]`)
      ?.focus();
  }

  protected trackRow = (index: number, row: T): unknown => {
    const trackByFn = this.trackBy();
    return trackByFn ? trackByFn(index, row) : row;
  };

  private pushSelection(): void {
    const next = [...this.selectionModel.selected];
    this.lastPushedSelection = next;
    this.selection.set(next);
  }
}
