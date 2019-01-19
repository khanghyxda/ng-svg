import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { tap, mergeMap, startWith, takeUntil, take, flatMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-svg-control',
  templateUrl: './svg-control.component.html',
  styleUrls: ['./svg-control.component.css']
})
export class SvgControlComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('slider') slider: ElementRef;
  @ViewChild('rect') rect: ElementRef;
  @ViewChild('bottomright') bottomright: ElementRef;
  @ViewChild('topright') topright: ElementRef;

  handle: Subscription;
  pt: SVGPoint;
  size: Size;
  angle: number;
  cosa: number;
  sina: number;
  rotate = 'rotate(30, 30, 30)';

  constructor() { }

  ngOnInit() {
    console.log(this.cosa);
    console.log(this.sina);
    this.size = new Size();
    this.size.width = 50;
    this.size.height = 70;
    this.pt = this.slider.nativeElement.createSVGPoint();
    this.rotate = 'rotate(30,' + (this.pt.x + this.size.width / 2) + ',' + (this.pt.y + this.size.height / 2 ) + ')';
  }

  ngOnDestroy(): void {

  }

  ngAfterViewInit(): void {

    this.drag(this.slider.nativeElement, this.rect.nativeElement);
  }

  drag(parent, element) {
    const moveParent = fromEvent(parent, 'mousemove')
      .pipe(tap((mm: MouseEvent) => mm.preventDefault()));
    const mouseup = fromEvent(document, 'mouseup')
      .pipe(tap((mu: MouseEvent) => mu.preventDefault()));

    const down = fromEvent(element, 'mousedown')
      .pipe(tap((md: MouseEvent) => md.preventDefault()));

    const mousedrag = down.pipe(flatMap((md: MouseEvent) => {
      const objX = this.pt.x;
      const objY = this.pt.y;
      const startX = md.clientX, startY = md.clientY;
      return moveParent.pipe(map((mm: MouseEvent) => {
        mm.preventDefault();
        return {
          left: objX + (mm.clientX - startX),
          top: objY + (mm.clientY - startY)
        };
      }), takeUntil(mouseup));
    }));

    const downResize = fromEvent(this.bottomright.nativeElement, 'mousedown')
      .pipe(tap((md: MouseEvent) => md.preventDefault()));
    const mouseResize = downResize.pipe(flatMap((md: MouseEvent) => {
      const objWidth = this.size.width;
      const objHeight = this.size.height;
      const startX = md.clientX, startY = md.clientY;
      return moveParent.pipe(map((mm: MouseEvent) => {
        mm.preventDefault();
        const width = objWidth + (mm.clientX - startX);
        const ratio = width / objWidth;
        const height = ratio * objHeight;
        if (width > 10 && height > 10) {
          return {
            width: width,
            height: height
          };
        } else {
          return {
            width: 0,
            height: 0
          };
        }
      }), takeUntil(mouseup));
    }));

    const downRotate = fromEvent(this.topright.nativeElement, 'mousedown')
      .pipe(tap((md: MouseEvent) => md.preventDefault()));
    const mouseRotate = downResize.pipe(flatMap((md: MouseEvent) => {
      const objWidth = this.size.width;
      const objHeight = this.size.height;
      const startX = md.clientX, startY = md.clientY;
      return moveParent.pipe(map((mm: MouseEvent) => {
        mm.preventDefault();
        const width = objWidth + (mm.clientX - startX);
        const ratio = width / objWidth;
        const height = ratio * objHeight;
        if (width > 10 && height > 10) {
          return {
            width: width,
            height: height
          };
        } else {
          return {
            width: 0,
            height: 0
          };
        }
      }), takeUntil(mouseup));
    }));

    down.subscribe((md) => {

    });

    mouseResize
      .subscribe((pos) => {
        if (pos.width !== 0) {
          this.size.width = pos.width;
          this.size.height = pos.height;
        }
      });

    mousedrag
      .subscribe((pos) => {
        this.pt.x = pos.left;
        this.pt.y = pos.top;
      });
  }

}

class Size {
  width: number;
  height: number;
}
