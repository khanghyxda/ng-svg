import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaintContainerComponent } from './paint-container.component';

describe('PaintContainerComponent', () => {
  let component: PaintContainerComponent;
  let fixture: ComponentFixture<PaintContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaintContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaintContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
