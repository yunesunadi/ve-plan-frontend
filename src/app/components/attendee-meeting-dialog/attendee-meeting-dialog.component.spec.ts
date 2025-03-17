import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendeeMeetingDialogComponent } from './attendee-meeting-dialog.component';

describe('AttendeeMeetingDialogComponent', () => {
  let component: AttendeeMeetingDialogComponent;
  let fixture: ComponentFixture<AttendeeMeetingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendeeMeetingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttendeeMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
