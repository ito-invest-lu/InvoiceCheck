import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseInvoiceComponent } from './browse-invoice.component';

describe('BrowseInvoiceComponent', () => {
  let component: BrowseInvoiceComponent;
  let fixture: ComponentFixture<BrowseInvoiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseInvoiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
