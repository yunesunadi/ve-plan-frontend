import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinedEventsComponent } from './joined-events.component';

describe('JoinedEventsComponent', () => {
  let component: JoinedEventsComponent;
  let fixture: ComponentFixture<JoinedEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinedEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinedEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
