import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitBudgetLineComponent } from './split-budget-line.component';

describe('SplitBudgetLineComponent', () => {
  let component: SplitBudgetLineComponent;
  let fixture: ComponentFixture<SplitBudgetLineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitBudgetLineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitBudgetLineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
