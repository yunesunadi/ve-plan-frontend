import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitedUsersDialogComponent } from './invited-users-dialog.component';

describe('InvitedUsersDialogComponent', () => {
  let component: InvitedUsersDialogComponent;
  let fixture: ComponentFixture<InvitedUsersDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitedUsersDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitedUsersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
