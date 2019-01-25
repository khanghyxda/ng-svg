import { PaintService } from './paint.service';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PaintObjectType } from './common.util';
import { fromEvent } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-paint-control',
  templateUrl: './paint-control.component.html',
  styleUrls: ['./paint-control.component.css'],
  providers: [PaintService]
})
export class PaintControlComponent implements OnInit, AfterViewInit {

  @ViewChild('control') control: ElementRef;
  @ViewChild('image') image: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  public context: CanvasRenderingContext2D;
  @Input('width') width: number;
  @Input('height') height: number;
  imageToShow: any;
  imageBlobUrl: any;

  listObject = [
  ];

  constructor(private paintService: PaintService, private sanitizer: DomSanitizer, private httpClient: HttpClient) {
    this.paintService.removeSelectedAnnounced$.subscribe(() => {
      this.removeSelected();
    });
  }

  ngOnInit() {
  }



  ngAfterViewInit(): void {
    const down = fromEvent(document, 'mousedown')
      .pipe(tap((md: MouseEvent) => md.preventDefault()));
    down.subscribe((md) => {
      this.removeSelected();
    });
    this.context = (<HTMLCanvasElement>this.canvas.nativeElement).getContext('2d');
  }

  removeSelected() {
    this.listObject.forEach(element => {
      element.selected = false;
    });
  }

  clickChooseFile(event) {
    event.target.value = '';
  }

  onFileChanged(event) {
    const file = event.target.files[0];
    if (file != null) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = (e) => {
        this.listObject.push({ type: PaintObjectType.image, base64: reader.result, selected: false });
      };
    }
  }

  svgToBase64() {
    const svg = new XMLSerializer().serializeToString(this.control.nativeElement);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const base64 = 'data:image/svg+xml;utf8,' + svg;
    const url = URL.createObjectURL(blob);
    this.imageBlobUrl = url;
  }

}

