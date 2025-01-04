import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterWrapperComponent } from './register-wrapper.component';

describe('RegisterWrapperComponent', () => {
  let component: RegisterWrapperComponent;
  let fixture: ComponentFixture<RegisterWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
