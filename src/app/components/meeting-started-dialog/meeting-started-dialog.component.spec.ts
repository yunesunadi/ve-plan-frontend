import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetingStartedDialogComponent } from './meeting-started-dialog.component';

describe('MeetingStartedDialogComponent', () => {
  let component: MeetingStartedDialogComponent;
  let fixture: ComponentFixture<MeetingStartedDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingStartedDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetingStartedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
