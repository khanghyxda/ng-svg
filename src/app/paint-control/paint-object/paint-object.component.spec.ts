import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaintObjectComponent } from './paint-object.component';

describe('PaintObjectComponent', () => {
  let component: PaintObjectComponent;
  let fixture: ComponentFixture<PaintObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaintObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaintObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
