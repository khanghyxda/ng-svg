import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { tap, mergeMap, startWith, takeUntil, take, flatMap, map, endWith } from 'rxjs/operators';
import { Subscription, fromEvent } from 'rxjs';


@Component({
  /* tslint:disable-next-line */
  selector: '[app-paint-object]',
  templateUrl: './paint-object.component.html',
  styleUrls: ['./paint-object.component.css']
})
export class PaintObjectComponent implements OnInit, AfterViewInit {

  @ViewChild('main') main: ElementRef;
  @ViewChild('image') image: ElementRef;
  @ViewChild('bottomright') bottomright: ElementRef;
  @ViewChild('topright') topright: ElementRef;

  controlSvg;
  pt: SVGPoint;
  size: Size;
  angle = 0;


  constructor() {
  }

  ngOnInit() {
    this.controlSvg = this.main.nativeElement.parentNode.parentNode;
    this.size = new Size();
    this.size.width = 50;
    this.size.height = 70;
    this.pt = this.controlSvg.createSVGPoint();
    this.pt.x = 50;
    this.pt.y = 50;
  }

  ngAfterViewInit(): void {

    this.drag(this.controlSvg, this.image.nativeElement);
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
      const topLeft = new Point(this.pt.x, this.pt.y);
      const bottomRight = new Point(this.pt.x + this.size.width, this.pt.y + this.size.height);
      const offset = this.controlSvg.getBoundingClientRect();
      const matrixStart = element.getScreenCTM();
      const point90 = new Point(this.pt.x + this.size.height + this.size.height * this.size.height / this.size.width, this.pt.y);
      const point90Transform = this.getPointAfterTransform(matrixStart, point90.x, point90.y);
      const startPoint = new Point(md.clientX - offset.left, md.clientY - offset.top);
      const topLeftTransform = this.getPointAfterTransform(matrixStart, topLeft.x, topLeft.y);
      return moveParent.pipe(map((mm: MouseEvent) => {
        mm.preventDefault();
        const endPoint = new Point(mm.clientX - offset.left, mm.clientY - offset.top);
        const d1 = this.getSideOfLine(point90Transform, startPoint, endPoint);
        const angle = this.calcAngle(topLeftTransform, startPoint, endPoint);
        const projetion = Math.abs(Math.cos(angle * Math.PI / 180) * this.calcSide(startPoint, endPoint));
        const diagonal = this.calcSide(topLeft, bottomRight);
        console.log('angle=' + angle);
        console.log('Math.cos(angle)=' + Math.cos(angle * Math.PI / 180));
        console.log('projetion=' + projetion);
        console.log('d1=' + d1);
        let ratio = 1 + projetion / diagonal;
        if (d1 < 0) {
          ratio = 1 - projetion / diagonal;
        }
        const width = ratio * objWidth;
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
    const mouseRotate = downRotate.pipe(flatMap((md: MouseEvent) => {
      const objWidth = this.size.width;
      const objHeight = this.size.height;
      const offset = this.controlSvg.getBoundingClientRect();
      const startAngle = this.angle;
      const startPoint = new Point(md.clientX - offset.left, md.clientY - offset.top);
      return moveParent.pipe(map((mm: MouseEvent) => {
        const endPoint = new Point(mm.clientX - offset.left, mm.clientY - offset.top);
        const centerObj = new Point(this.pt.x + (objWidth / 2), this.pt.y + (objHeight / 2));
        const changeAngle = this.calcAngle(startPoint, centerObj, endPoint);
        const d1 = this.getSideOfLine(startPoint, centerObj, endPoint);
        console.log('startPoint=' + startPoint.x + '/' + startPoint.y);
        console.log('centerObj=' + centerObj.x + '/' + centerObj.y);
        console.log('start=' + startAngle);
        console.log('change=' + changeAngle);
        console.log('d1=' + d1);
        if (d1 < 0) {
          return {
            angle:
              startAngle - changeAngle,
          };
        }
        if (d1 > 0) {
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

    down.subscribe((md) => {

    });

    mouseRotate
      .subscribe((pos) => {
        this.angle = pos.angle;
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

  calcAngle(pointA: Point, pointB: Point, pointC: Point) {
    const a = this.calcSide(pointA, pointC);
    const b = this.calcSide(pointB, pointA);
    const c = this.calcSide(pointC, pointB);
    const cosa = (c * c + b * b - a * a) / (2 * b * c);
    return Math.acos(cosa) * (180 / Math.PI);
  }

  calcSide(pointA: Point, pointB: Point) {
    return Math.sqrt((pointA.x - pointB.x) * (pointA.x - pointB.x) + (pointA.y - pointB.y) * (pointA.y - pointB.y));
  }

  getSideOfLine(pointA: Point, pointB: Point, pointCheck: Point) {
    const d = (pointCheck.x - pointA.x) * (pointB.y - pointA.y) - (pointCheck.y - pointA.y) * (pointB.x - pointA.x);
    return d;
  }

  getPointAfterTransform(matrix, x, y) {
    const offset = this.controlSvg.getBoundingClientRect();
    return new Point((matrix.a * x) + (matrix.c * y) + matrix.e - offset.left, (matrix.b * x) + (matrix.d * y) + matrix.f - offset.top);
  }
}

class Size {
  width: number;
  height: number;
}

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  x: number;
  y: number;
}

