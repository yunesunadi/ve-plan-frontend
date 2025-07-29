import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { format } from "date-fns";
import { EventService } from '../../services/event.service';
import { CommonService } from '../../services/common.service';
import { concatMap, iif, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EventCacheService } from '../../caches/event-cache.service';
import { EventCategoryType, EventType } from '../../models/Event';

@Component({
  standalone: false,
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrl: './event-dialog.component.scss'
})
export class EventDialogComponent {
  @ViewChild("imgView") imgView!: ElementRef;

  create_form: FormGroup;
  categories: EventCategoryType[] = ["conference", "meetup", "webinar"];
  types: EventType[] = ["public", "private"];

  private form_builder = inject(FormBuilder);
  dialog_data = inject(MAT_DIALOG_DATA);
  private eventService = inject(EventService);
  private commonService = inject(CommonService);
  private dialog = inject(MatDialogRef<this>);
  cache = inject(EventCacheService);

  constructor() {
    this.create_form = this.form_builder.group({
      cover: [this.dialog_data.cover],
      title: [this.dialog_data.title || '', Validators.required],
      description: [this.dialog_data.description || '', Validators.required],
      date: [this.dialog_data.date, Validators.required],
      start_time: [this.dialog_data.start_time || '', Validators.required],
      end_time: [this.dialog_data.end_time || '', Validators.required],
      category: [this.dialog_data.category || '', Validators.required],
      type: [this.dialog_data.type || '', Validators.required],
    },
    {
      validators: this.checkTimeValidator()
    });
  }

  checkTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const start_time = new Date(control.value['start_time']).getTime();
      const end_time = new Date(control.value['end_time']).getTime();

      if (start_time > end_time) return { invalidTime: true };

      return null;
    };
  }

  ngAfterViewInit() {
    this.imgView.nativeElement.src = this.dialog_data.cover ? `${environment.coverUrl}/${this.dialog_data.cover}` : 'assets/images/placeholder.jpg';
  }

  get titleControl() {
    return this.create_form.controls["title"];
  }

  get descriptionControl() {
    return this.create_form.controls["description"];
  }

  get startTimeControl() {
    return this.create_form.controls["start_time"];
  }

  get endTimeControl() {
    return this.create_form.controls["end_time"];
  }

  get categoryControl() {
    return this.create_form.controls["category"];
  }

  get typeControl() {
    return this.create_form.controls["type"];
  }

  get eventDate() {
    return format(this.dialog_data.date, "dd/MM/yyyy");
  }

  changeCover(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    
    if (file) {
      if (!file.type.startsWith("image")) return;

      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        this.imgView.nativeElement.src = event.target?.result;
      }
      fileReader.readAsDataURL(file);
      
      this.create_form.get("cover")?.patchValue(file);
    }
  }

  submit() {
    this.create_form.markAllAsTouched();

    if (this.create_form.invalid) return;

    of(true).pipe(
      concatMap(() => iif(
        () => !!this.dialog_data._id,
        this.eventService.update(this.dialog_data._id, this.create_form.value),
        this.eventService.create(this.create_form.value)
      ))
    ).subscribe({
      next: (res) => {
        this.commonService.openSnackBar(res.message);
        this.dialog.close();
        this.cache.reset();
        this.cache.resetQuery$.next(true);
        this.cache.resetMyEventsQuery$.next(true);
      },
      error: (err) => {
        this.commonService.openSnackBar("Error creating event.");
        this.dialog.close();
      }
    });
  }
}
