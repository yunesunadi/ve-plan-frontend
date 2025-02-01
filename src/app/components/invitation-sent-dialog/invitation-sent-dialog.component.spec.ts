import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationSentDialogComponent } from './invitation-sent-dialog.component';

describe('InvitationSentDialogComponent', () => {
  let component: InvitationSentDialogComponent;
  let fixture: ComponentFixture<InvitationSentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationSentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitationSentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
