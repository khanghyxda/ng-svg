import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { tap, takeUntil, flatMap, map, } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { getSideOfLine, calcAngle, calcSide, Point } from '../common.util';
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
      const bbox = element.getBBox();
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
      console.log(bbox);
      this.drag();
    }, 200);
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
        const sideOfLine = getSideOfLine(point90Transform, bottomRightTransform, endPoint);
        const angle = calcAngle(topLeftTransform, bottomRightTransform, endPoint);
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
      const topLeftTransform = this.getPointAfter(this.getPoint(bbox.x, bbox.y), this.currentMatrix);
      const topRightTransform = this.getPointAfter(this.getPoint(bbox.x + bbox.width, bbox.y), this.currentMatrix);
      const centerTransform = this.getPointAfter(this.getPoint(bbox.x + bbox.width / 2, bbox.y + bbox.height / 2), this.currentMatrix);
      const offset = this.controlSvg.getBoundingClientRect();
      return moveParent.pipe(map((mm: MouseEvent) => {
        const endPoint = this.getPoint(mm.clientX - offset.left, mm.clientY - offset.top);
        const changeAngle = calcAngle(topRightTransform, topLeftTransform, endPoint);
        const sideOfLine = getSideOfLine(topRightTransform, topLeftTransform, endPoint);
        const vector = { x: centerTransform.x - topLeftTransform.x, y: centerTransform.y - topLeftTransform.y };
        if (sideOfLine < 0) {
          return {
            angle:
              -1 * changeAngle,
          };
        }
        return {
          angle:
            changeAngle,
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
          this.setMatrix(this.currentMatrix.scale(0.01).rotate(pos.angle).scale(100));
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

  getTranslateMatrix(matrix, cx, cy) {
    const matrixReturn = this.controlSvg.createSVGMatrix();
    matrixReturn.a = matrix.a;
    matrixReturn.b = matrix.b;
    matrixReturn.c = matrix.c;
    matrixReturn.d = matrix.d;
    matrixReturn.e = matrix.e + cx;
    matrixReturn.f = matrix.f + cy;
    return matrixReturn;
  }

  getMatrixRotate(angle, x, y) {
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

