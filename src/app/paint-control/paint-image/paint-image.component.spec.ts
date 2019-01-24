import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaintImageComponent } from './paint-image.component';

describe('PaintImageComponent', () => {
  let component: PaintImageComponent;
  let fixture: ComponentFixture<PaintImageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaintImageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaintImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
