import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChantierComponent } from './edit-chantier.component';

describe('EditChantierComponent', () => {
  let component: EditChantierComponent;
  let fixture: ComponentFixture<EditChantierComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditChantierComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditChantierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
