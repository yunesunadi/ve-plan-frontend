import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerMeetingDialogComponent } from './organizer-meeting-dialog.component';

describe('OrganizerMeetingDialogComponent', () => {
  let component: OrganizerMeetingDialogComponent;
  let fixture: ComponentFixture<OrganizerMeetingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerMeetingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizerMeetingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
