import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { tap, takeUntil, flatMap, map, } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { Point, getPointAfterTransform, getSideOfLine, calcAngle, calcSide, urlToBase64, calcInitImage, calcDpi } from '../paint.util';
import { PaintService } from '../paint.service';

@Component({
  /* tslint:disable-next-line */
  selector: '[app-paint-image]',
  templateUrl: './paint-image.component.html',
  styleUrls: ['./paint-image.component.css']
})
export class PaintImageComponent implements OnInit, AfterViewInit {

  @Input('objectInfo') objectInfo;
  @ViewChild('main') main: ElementRef;
  @ViewChild('image') image: ElementRef;
  @ViewChild('bottomright') bottomright: ElementRef;
  @ViewChild('topright') topright: ElementRef;
  @ViewChild('topleft') topleft: ElementRef;
  @Input('template') template;

  controlSvg;
  rIcon = 8;
  base64: any;

  constructor(private paintService: PaintService) {
  }

  ngOnInit() {
    this.controlSvg = this.main.nativeElement.parentNode.parentNode.parentNode;
    if (this.objectInfo.size === undefined) {
      const calcInit = calcInitImage(this.objectInfo.image.width, this.objectInfo.image.height, 150, this.template);
      console.log(calcInit);
      const calcDpiNum = calcDpi(this.objectInfo.image.width, calcInit.resizeWidthPx, this.template);
      console.log(calcDpiNum);
      this.objectInfo.size = {};
      this.objectInfo.size.width = calcInit.resizeWidthPx;
      this.objectInfo.size.height = calcInit.resizeHeightPx;
    }
    if (this.objectInfo.pt === undefined) {
      this.objectInfo.pt = {};
      this.objectInfo.pt.x = this.template.paintWidth / 2 - this.objectInfo.size.width / 2;
      this.objectInfo.pt.y = 50;
    }
    if (this.objectInfo.angle === undefined) {
      this.objectInfo.angle = 0;
    }
    urlToBase64(this.objectInfo.image.src).then((base64) => {
      this.base64 = base64;
    }).catch((error) => {
      this.paintService.cleanList();
    });
  }

  ngAfterViewInit(): void {
    const element = this.image.nativeElement;
    this.drag(this.controlSvg, element);
  }

  drag(parent, element) {
    const moveParent = fromEvent(parent, 'mousemove')
      .pipe(tap((mm: MouseEvent) => mm.preventDefault()));
    const mouseup = fromEvent(document, 'mouseup')
      .pipe(tap((mu: MouseEvent) => mu.preventDefault()));

    const down = fromEvent(element, 'mousedown')
      .pipe(tap((md: MouseEvent) => { md.preventDefault(); md.stopPropagation(); }));

    const mouseDrag = down.pipe(flatMap((md: MouseEvent) => {
      const objX = this.objectInfo.pt.x;
      const objY = this.objectInfo.pt.y;
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
      .pipe(tap((md: MouseEvent) => { md.preventDefault(); md.stopPropagation(); }));
    const mouseResize = downResize.pipe(flatMap((md: MouseEvent) => {
      const objWidth = this.objectInfo.size.width;
      const objHeight = this.objectInfo.size.height;
      const topLeft = new Point(this.objectInfo.pt.x, this.objectInfo.pt.y);
      const bottomRight = new Point(this.objectInfo.pt.x + this.objectInfo.size.width, this.objectInfo.pt.y + this.objectInfo.size.height);
      const offset = this.controlSvg.getBoundingClientRect();
      const matrixStart = element.getScreenCTM();
      const point90 = new Point(this.objectInfo.pt.x + this.objectInfo.size.height
        + this.objectInfo.size.height * this.objectInfo.size.height / this.objectInfo.size.width, this.objectInfo.pt.y);
      const point90Transform = getPointAfterTransform(this.controlSvg, matrixStart, point90);
      const startPoint = new Point(md.clientX - offset.left, md.clientY - offset.top);
      const topLeftTransform = getPointAfterTransform(this.controlSvg, matrixStart, topLeft);
      return moveParent.pipe(map((mm: MouseEvent) => {
        mm.preventDefault();
        const endPoint = new Point(mm.clientX - offset.left, mm.clientY - offset.top);
        const sideOfLine = getSideOfLine(point90Transform, startPoint, endPoint);
        const angle = calcAngle(topLeftTransform, startPoint, endPoint);
        const projetion = Math.abs(Math.cos(angle * Math.PI / 180) * calcSide(startPoint, endPoint));
        const diagonal = calcSide(topLeft, bottomRight);
        let ratio = 1 + projetion / diagonal;
        if (sideOfLine < 0) {
          ratio = 1 - projetion / diagonal;
        }
        const width = ratio * objWidth;
        const height = ratio * objHeight;
        if (width > 20 && height > 20) {
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
      .pipe(tap((md: MouseEvent) => { md.preventDefault(); md.stopPropagation(); }));
    const mouseRotate = downRotate.pipe(flatMap((md: MouseEvent) => {
      const objWidth = this.objectInfo.size.width;
      const objHeight = this.objectInfo.size.height;
      const offset = this.controlSvg.getBoundingClientRect();
      const startAngle = this.objectInfo.angle;
      const startPoint = new Point(md.clientX - offset.left, md.clientY - offset.top);
      return moveParent.pipe(map((mm: MouseEvent) => {
        const endPoint = new Point(mm.clientX - offset.left, mm.clientY - offset.top);
        const centerObj = new Point(this.objectInfo.pt.x + (objWidth / 2), this.objectInfo.pt.y + (objHeight / 2));
        const changeAngle = calcAngle(startPoint, centerObj, endPoint);
        const sideOfLine = getSideOfLine(startPoint, centerObj, endPoint);
        if (sideOfLine < 0) {
          return {
            angle:
              startAngle - changeAngle,
          };
        }
        if (sideOfLine > 0) {
          return {
            angle:
              startAngle + changeAngle,
          };
        }
        return {
          angle:
            startAngle,
        };
      }), takeUntil(mouseup));
    }));

    const downDelete = fromEvent(this.topleft.nativeElement, 'mousedown')
      .pipe(tap((md: MouseEvent) => { md.preventDefault(); md.stopPropagation(); }));

    downDelete.subscribe((md) => {
      if (this.objectInfo.selected) {
        this.paintService.deleteObject(this.objectInfo.id);
      }
    });

    down.subscribe((md) => {
      this.paintService.removeSelected();
      this.objectInfo.selected = true;
    });

    mouseRotate
      .subscribe((pos) => {
        if (this.objectInfo.selected) {
          this.objectInfo.angle = pos.angle;
        }
      });

    mouseResize
      .subscribe((pos) => {
        if (this.objectInfo.selected) {
          if (pos.width !== 0) {
            this.objectInfo.size.width = pos.width;
            this.objectInfo.size.height = pos.height;
          }
        }
      });

    mouseDrag
      .subscribe((pos) => {
        if (this.objectInfo.selected) {
          this.objectInfo.pt.x = pos.left;
          this.objectInfo.pt.y = pos.top;
        }
      });
  }
}
