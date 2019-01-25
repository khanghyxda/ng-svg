import { Component, OnInit, Input, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { tap, takeUntil, flatMap, map, } from 'rxjs/operators';
import { fromEvent, Observable } from 'rxjs';
import { Point, getPointAfterTransform, getSideOfLine, calcAngle, calcSide, Size } from '../common.util';
import { PaintService } from '../paint.service';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

  controlSvg;
  pt: SVGPoint;
  size: Size;
  angle = 0;
  rIcon = 12;

  constructor(private paintService: PaintService, private httpClient: HttpClient) {
  }

  ngOnInit() {
    this.controlSvg = this.main.nativeElement.parentNode.parentNode.parentNode;
    this.size = new Size();
    this.size.width = 50;
    this.size.height = 70;
    this.pt = this.controlSvg.createSVGPoint();
    this.pt.x = 50;
    this.pt.y = 50;
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
      .pipe(tap((md: MouseEvent) => { md.preventDefault(); md.stopPropagation(); }));
    const mouseResize = downResize.pipe(flatMap((md: MouseEvent) => {
      const objWidth = this.size.width;
      const objHeight = this.size.height;
      const topLeft = new Point(this.pt.x, this.pt.y);
      const bottomRight = new Point(this.pt.x + this.size.width, this.pt.y + this.size.height);
      const offset = this.controlSvg.getBoundingClientRect();
      const matrixStart = element.getScreenCTM();
      const point90 = new Point(this.pt.x + this.size.height + this.size.height * this.size.height / this.size.width, this.pt.y);
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
      const objWidth = this.size.width;
      const objHeight = this.size.height;
      const offset = this.controlSvg.getBoundingClientRect();
      const startAngle = this.angle;
      const startPoint = new Point(md.clientX - offset.left, md.clientY - offset.top);
      return moveParent.pipe(map((mm: MouseEvent) => {
        const endPoint = new Point(mm.clientX - offset.left, mm.clientY - offset.top);
        const centerObj = new Point(this.pt.x + (objWidth / 2), this.pt.y + (objHeight / 2));
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

    down.subscribe((md) => {
      this.paintService.removeSelected();
      this.objectInfo.selected = true;
    });

    mouseRotate
      .subscribe((pos) => {
        if (this.objectInfo.selected) {
          this.angle = pos.angle;
        }
      });

    mouseResize
      .subscribe((pos) => {
        if (this.objectInfo.selected) {
          if (pos.width !== 0) {
            this.size.width = pos.width;
            this.size.height = pos.height;
          }
        }
      });

    mouseDrag
      .subscribe((pos) => {
        if (this.objectInfo.selected) {
          this.pt.x = pos.left;
          this.pt.y = pos.top;
        }
      });
  }

}
