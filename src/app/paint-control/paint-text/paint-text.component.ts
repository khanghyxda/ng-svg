import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { tap, takeUntil, flatMap, map, } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { Point, getPointAfterTransform, getSideOfLine, calcAngle, calcSide, Size } from '../common.util';
import { PaintService } from '../paint.service';
@Component({
  /* tslint:disable-next-line */
  selector: '[app-paint-text]',
  templateUrl: './paint-text.component.html',
  styleUrls: ['./paint-text.component.css']
})
export class PaintTextComponent implements OnInit, AfterViewInit {

  @Input('objectInfo') objectInfo;
  @ViewChild('main') main: ElementRef;
  @ViewChild('text') text: ElementRef;
  @ViewChild('edit') edit: ElementRef;
  @ViewChild('bottomright') bottomright: ElementRef;
  @ViewChild('topright') topright: ElementRef;

  controlSvg;
  rIcon = 5;
  currentMatrix: SVGMatrix;

  constructor(private paintService: PaintService) {
  }

  ngOnInit() {
    this.controlSvg = this.main.nativeElement.parentNode.parentNode.parentNode;
    const element = this.text.nativeElement;
    if (this.objectInfo.width === undefined) {
      const bbox = this.text.nativeElement.getBBox();
      this.objectInfo.width = bbox.width;
      this.objectInfo.a = 1;
      this.objectInfo.b = 0;
      this.objectInfo.c = 0;
      this.objectInfo.d = 1;
      this.objectInfo.e = 50;
      this.objectInfo.f = 50;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const element = this.text.nativeElement;
      const bbox = element.getBBox();
      this.objectInfo.width = bbox.width;
      this.drag();
    }, 100);
  }

  drag() {
    const element = this.text.nativeElement;
    const parent = this.controlSvg;
    const edit = this.edit.nativeElement;
    const moveParent = fromEvent(parent, 'mousemove')
      .pipe(tap((mm: MouseEvent) => mm.preventDefault()));
    const mouseup = fromEvent(document, 'mouseup')
      .pipe(tap((mu: MouseEvent) => mu.preventDefault()));
    const down = fromEvent(edit, 'mousedown')
      .pipe(tap((md: MouseEvent) => { md.stopPropagation(); }));

    const mouseDrag = down.pipe(flatMap((md: MouseEvent) => {
      this.currentMatrix = this.getCurrentMatrix();
      return moveParent.pipe(map((mm: MouseEvent) => {
        mm.preventDefault();
        return {
          left: mm.clientX - md.clientX,
          top: mm.clientY - md.clientY
        };
      }), takeUntil(mouseup));
    }));

    const downResize = fromEvent(this.bottomright.nativeElement, 'mousedown')
      .pipe(tap((md: MouseEvent) => { md.preventDefault(); md.stopPropagation(); }));
    const mouseResize = downResize.pipe(flatMap((md: MouseEvent) => {
      this.currentMatrix = this.getCurrentMatrix();
      const bbox = element.getBBox();
      const topLeftTransform = this.getPointAfter(this.getPoint(bbox.x, bbox.y), this.currentMatrix);
      const bottomRightTransform = this.getPointAfter(this.getPoint(bbox.x + bbox.width, bbox.y + bbox.height), this.currentMatrix);
      const point90Transform = this.getPointAfter(this.getPoint(bbox.x + bbox.height
        + bbox.height * bbox.height / bbox.width, bbox.y), this.currentMatrix);
      const offset = this.controlSvg.getBoundingClientRect();
      const startPoint = new Point(md.clientX - offset.left, md.clientY - offset.top);
      return moveParent.pipe(map((mm: MouseEvent) => {
        mm.preventDefault();
        const endPoint = new Point(mm.clientX - offset.left, mm.clientY - offset.top);
        const sideOfLine = getSideOfLine(point90Transform, startPoint, endPoint);
        const angle = calcAngle(topLeftTransform, startPoint, endPoint);
        const projetion = Math.abs(Math.cos(angle * Math.PI / 180) * calcSide(startPoint, endPoint));
        const diagonal = calcSide(topLeftTransform, bottomRightTransform);
        let ratio = 1 + projetion / diagonal;
        if (sideOfLine < 0) {
          ratio = 1 - projetion / diagonal;
        }
        return {
          ratio: ratio,
        };
      }), takeUntil(mouseup));
    }));

    const downRotate = fromEvent(this.topright.nativeElement, 'mousedown')
      .pipe(tap((md: MouseEvent) => { md.preventDefault(); md.stopPropagation(); }));
    const mouseRotate = downRotate.pipe(flatMap((md: MouseEvent) => {
      this.currentMatrix = this.getCurrentMatrix();
      const bbox = element.getBBox();
      const centerTransform = this.getPointAfter(this.getPoint(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2), this.currentMatrix);
      const offset = this.controlSvg.getBoundingClientRect();
      const startAngle = this.objectInfo.angle;
      const startPoint = new Point(md.clientX - offset.left, md.clientY - offset.top);
      return moveParent.pipe(map((mm: MouseEvent) => {
        const endPoint = new Point(mm.clientX - offset.left, mm.clientY - offset.top);
        const changeAngle = calcAngle(startPoint, centerTransform, endPoint);
        const sideOfLine = getSideOfLine(startPoint, centerTransform, endPoint);
        const vector = { x: endPoint.x - startPoint.x, y: endPoint.y - startPoint.y };
        console.log(changeAngle);
        return {
          angle:
            changeAngle,
          center: centerTransform
        };
      }), takeUntil(mouseup));
    }));


    down.subscribe((md) => {
      this.paintService.removeSelected();
      this.objectInfo.selected = true;
    });

    mouseDrag
      .subscribe((pos) => {
        if (this.objectInfo.selected) {
          this.objectInfo.e = this.currentMatrix.e + pos.left;
          this.objectInfo.f = this.currentMatrix.f + pos.top;
        }
      });

    mouseResize
      .subscribe((pos) => {
        if (this.objectInfo.selected) {
          const afterMatrix = this.currentMatrix.scale(pos.ratio);
          this.setMatrix(afterMatrix);
        }
      });

    mouseRotate
      .subscribe((pos) => {
        if (this.objectInfo.selected) {
          const rotateMatrix = this.getMatrixRotate(pos.angle, pos.center.x, pos.center.y);
          const afterMatrix = this.currentMatrix.translate(-1 * pos.center.x, -1 * pos.center.y);
          this.setMatrix(afterMatrix);
        }
      });
  }

  changeText(event) {
    this.objectInfo.text = event.target.textContent;
    setTimeout(() => {
      const bbox = this.text.nativeElement.getBBox();
      this.objectInfo.width = bbox.width;
    }, 100);
  }

  setMatrix(matrix) {
    this.objectInfo.a = matrix.a;
    this.objectInfo.b = matrix.b;
    this.objectInfo.c = matrix.c;
    this.objectInfo.d = matrix.d;
    this.objectInfo.e = matrix.e;
    this.objectInfo.f = matrix.f;
  }

  getMatrixRotate(angle, x, y) {
    console.log(angle);
    const a = angle * Math.PI / 180;
    const matrix = this.controlSvg.createSVGMatrix();
    matrix.a = Math.cos(a);
    matrix.b = Math.sin(a);
    matrix.c = -1 * Math.sin(a);
    matrix.d = Math.cos(a);
    matrix.e = -1 * Math.cos(a) * x + Math.sin(a) * y + x;
    matrix.f = -1 * Math.sin(a) * x - Math.cos(a) * y + y;
    return matrix;
  }

  getCurrentMatrix() {
    const matrix = this.controlSvg.createSVGMatrix();
    matrix.a = this.objectInfo.a;
    matrix.b = this.objectInfo.b;
    matrix.c = this.objectInfo.c;
    matrix.d = this.objectInfo.d;
    matrix.e = this.objectInfo.e;
    matrix.f = this.objectInfo.f;
    return matrix;
  }

  getPoint(x, y) {
    const point = this.controlSvg.createSVGPoint();
    point.x = x;
    point.y = y;
    return point;
  }

  getPointAfter(point: SVGPoint, matrix: SVGMatrix) {
    return point.matrixTransform(matrix);
  }

}

