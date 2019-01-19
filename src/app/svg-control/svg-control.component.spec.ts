import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SvgControlComponent } from './svg-control.component';

describe('SvgControlComponent', () => {
  let component: SvgControlComponent;
  let fixture: ComponentFixture<SvgControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SvgControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvgControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
