import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BrowseDevisComponent } from './browse-devis.component';

describe('BrowseDevisComponent', () => {
  let component: BrowseDevisComponent;
  let fixture: ComponentFixture<BrowseDevisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BrowseDevisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BrowseDevisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
