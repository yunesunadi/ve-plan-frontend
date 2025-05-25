import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventAttendeesComponent } from './event-attendees.component';

describe('EventAttendeesComponent', () => {
  let component: EventAttendeesComponent;
  let fixture: ComponentFixture<EventAttendeesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventAttendeesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventAttendeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
