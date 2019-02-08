import { PaintService, IImage } from './../paint.service';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { blobToUrl } from '../paint.util';

@Component({
  selector: 'app-paint-container',
  templateUrl: './paint-container.component.html',
  styleUrls: ['./paint-container.component.css']
})
export class PaintContainerComponent implements OnInit, AfterViewInit {
  @ViewChild('control') control: ElementRef;
  @ViewChild('image') image: ElementRef;
  @ViewChild('imageBg') imageBg: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  context: CanvasRenderingContext2D;
  @ViewChild('canvasPaint') canvasPaint: ElementRef;
  contextPaint: CanvasRenderingContext2D;
  @Input('listObject') listObject: any[];
  @Input('isFront') isFront: boolean;
  @Input('params') params: {};
  @Input('template') template;

  constructor(private paintService: PaintService) {
    paintService.previewAnnounced$.subscribe(() => {
      this.preview();
    });
    paintService.designAnnounced$.subscribe(() => {
      this.design();
    });
    paintService.designCompleteAnnounced$.subscribe(() => {
      this.designComplete();
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.context = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
    this.contextPaint = (<HTMLCanvasElement>this.canvasPaint.nativeElement).getContext('2d');
  }

  getListObj() {
    return this.listObject.filter((o) => o.isFront === this.isFront);
  }

  preview() {
    const blobSvg = this.getBlobSvg();
    const reader = new FileReader();
    const url = blobToUrl(blobSvg);
    reader.readAsDataURL(blobSvg);
    reader.onloadend = () => {
      const image = new Image();
      image.src = url;
      setTimeout(() => {
        this.context.clearRect(0, 0, this.template.width, this.template.height);
        this.context.fillStyle = '#fff';
        this.context.fillRect(0, 0, this.template.width, this.template.height);
        this.context.drawImage(this.imageBg.nativeElement, 0, 0, this.template.width, this.template.height);
        this.context.drawImage(image, this.template.startX, this.template.startY,
          this.template.paintWidth, this.template.paintHeight);
      }, 200);
    };
  }

  design() {
  }

  designComplete() {
    const blobSvg = this.getBlobSvg();
    const reader = new FileReader();
    reader.readAsDataURL(blobSvg);
    reader.onloadend = () => {
      const image = new Image();
      image.src = reader.result.toString();
      setTimeout(() => {
        this.contextPaint.clearRect(0, 0, this.template.paintWidth, this.template.paintHeight);
        this.contextPaint.drawImage(image, 0, 0,
          this.template.paintWidth, this.template.paintHeight);
        this.canvas.nativeElement.toBlob((blobCanvas) => {
          const iImage = new IImage();
          iImage.svgImage = blobToUrl(blobSvg);
          iImage.pngImage = blobToUrl(blobCanvas);
          iImage.isFront = this.isFront;
          this.paintService.sendImage(iImage);
        }, 'image/png', 2);
      }, 200);
    };
  }

  getBlobSvg() {
    const svg = new XMLSerializer().serializeToString(this.control.nativeElement);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    return blob;
  }


}
