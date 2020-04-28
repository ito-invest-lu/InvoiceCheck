import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanCellComponent } from './plan-cell.component';

describe('PlanCellComponent', () => {
  let component: PlanCellComponent;
  let fixture: ComponentFixture<PlanCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlanCellComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanCellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
