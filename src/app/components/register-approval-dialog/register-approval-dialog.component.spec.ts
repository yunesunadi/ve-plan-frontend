import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterApprovalDialogComponent } from './register-approval-dialog.component';

describe('RegisterApprovalDialogComponent', () => {
  let component: RegisterApprovalDialogComponent;
  let fixture: ComponentFixture<RegisterApprovalDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterApprovalDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterApprovalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
