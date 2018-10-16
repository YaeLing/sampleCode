import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAccountListComponent } from './add-account-list.component';

describe('AddAccountListComponent', () => {
  let component: AddAccountListComponent;
  let fixture: ComponentFixture<AddAccountListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddAccountListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAccountListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
