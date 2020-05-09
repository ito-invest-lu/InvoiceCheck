import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DbLogComponent } from './db-log.component';

describe('DbLogComponent', () => {
  let component: DbLogComponent;
  let fixture: ComponentFixture<DbLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DbLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
