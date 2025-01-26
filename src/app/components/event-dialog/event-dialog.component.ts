import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { format } from "date-fns";
import { EventService } from '../../services/event.service';
import { CommonService } from '../../services/common.service';
import { concatMap, iif, of } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrl: './event-dialog.component.scss'
})
export class EventDialogComponent {
  @ViewChild("imgView") imgView: any;

  create_form: FormGroup;
  categories = ["conference", "meetup", "webinar"];
  types = ["public", "private"];

  private form_builder = inject(FormBuilder);
  private dialog_data = inject(MAT_DIALOG_DATA);
  private eventService = inject(EventService);
  private commonService = inject(CommonService);
  private dialog = inject(MatDialogRef<this>);

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
    });
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

  changeCover(event: any) {
    const file = event.target?.files[0];
    
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
      },
      error: (err) => {
        this.commonService.openSnackBar("Error creating event.");
        this.dialog.close();
      }
    });
  }
}
