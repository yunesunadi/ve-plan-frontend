import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionDetailsCardComponent } from './session-details-card.component';

describe('SessionDetailsCardComponent', () => {
  let component: SessionDetailsCardComponent;
  let fixture: ComponentFixture<SessionDetailsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionDetailsCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionDetailsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
