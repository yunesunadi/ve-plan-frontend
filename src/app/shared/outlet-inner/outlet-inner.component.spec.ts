import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutletInnerComponent } from './outlet-inner.component';

describe('OutletInnerComponent', () => {
  let component: OutletInnerComponent;
  let fixture: ComponentFixture<OutletInnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutletInnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutletInnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
