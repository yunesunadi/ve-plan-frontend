import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { format } from "date-fns";

@Component({
  standalone: false,
  selector: 'app-event-dialog',
  templateUrl: './event-dialog.component.html',
  styleUrl: './event-dialog.component.scss'
})
export class EventDialogComponent {
  @ViewChild("imgView") imgView: any;

  create_form: FormGroup;
  categories = ["Conference", "Meetup", "Webinar"];
  types = ["Public", "Private"];

  private form_builder = inject(FormBuilder);
  private dialog_data = inject(MAT_DIALOG_DATA)

  constructor() {
    this.create_form = this.form_builder.group({
      cover: [''],
      title: ['', Validators.required],
      description: ['', Validators.required],
      date: [format(this.dialog_data.date, "dd/MM/yyyy"), Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      category: ['', Validators.required],
      type: ['', Validators.required],
    });
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
    
  }
}
