import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialLoginRedirectComponent } from './social-login-redirect.component';

describe('SocialLoginRedirectComponent', () => {
  let component: SocialLoginRedirectComponent;
  let fixture: ComponentFixture<SocialLoginRedirectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialLoginRedirectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialLoginRedirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
