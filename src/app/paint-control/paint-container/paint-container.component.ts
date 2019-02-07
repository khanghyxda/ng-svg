import { PaintService } from './../paint.service';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

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
  @Input('listObject') listObject: any[];
  @Input('isFront') isFront: boolean;
  @Input('params') params: {};
  @Input('template') template;
  context: CanvasRenderingContext2D;

  constructor(private paintService: PaintService) {
    paintService.previewAnnounced$.subscribe(() => {
      this.preview();
    });
    paintService.designAnnounced$.subscribe(() => {
      this.design();
    });
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    this.context = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
  }

  getListObj() {
    return this.listObject.filter((o) => o.isFront === this.isFront);
  }

  preview() {
    const svg = new XMLSerializer().serializeToString(this.control.nativeElement);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = (e) => {
      // Base64 SVG
      console.log(reader.result);
      const image = new Image();
      image.src = reader.result.toString();
      setTimeout(() => {
        this.context.clearRect(0, 0, this.template.width, this.template.height);
        this.context.fillStyle = '#fff';
        this.context.fillRect(0, 0, this.template.width, this.template.height);
        this.context.drawImage(this.imageBg.nativeElement, 0, 0, this.template.width, this.template.height);
        this.context.drawImage(image, this.template.startX, this.template.startY,
          this.template.paintWidth, this.template.paintHeight);
        this.canvas.nativeElement.toBlob((b) => {
          console.log(b);
        }, 'image/png', 2);
        // const imgURI = this.canvas.nativeElement.toDataURL('image/png');
        // console.log(imgURI);
      }, 200);
    };
  }

  design() {

  }

}
