import { PaintService } from './paint.service';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PaintObjectType } from './common.util';
import { fromEvent } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-paint-control',
  templateUrl: './paint-control.component.html',
  styleUrls: ['./paint-control.component.css'],
  providers: [PaintService]
})
export class PaintControlComponent implements OnInit, AfterViewInit {

  @ViewChild('control') control: ElementRef;
  @ViewChild('image') image: ElementRef;
  @ViewChild('imageBg') imageBg: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;
  public context: CanvasRenderingContext2D;
  @Input('width') width: number;
  @Input('height') height: number;
  @Input('startX') startX: number;
  @Input('startY') startY: number;
  @Input('sizeX') sizeX: number;
  @Input('sizeY') sizeY: number;
  imageToShow: any;
  imageBlobUrl: any;

  listObject = [
    { type: PaintObjectType.text, text: 'TEST', base64: null, selected: false }
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
      .pipe();
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
        this.listObject.push({ type: PaintObjectType.image, text: null, base64: reader.result, selected: false });
      };

    }
  }

  svgToBase64() {
    const svg = new XMLSerializer().serializeToString(this.control.nativeElement);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const base64 = 'data:image/svg+xml;utf8,' + svg;
    const url = URL.createObjectURL(blob);
    this.imageBlobUrl = url;
  }

  svgToPng() {
    // console.log(JSON.stringify(this.listObject));
    const svg = new XMLSerializer().serializeToString(this.control.nativeElement);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });

    const formData: FormData = new FormData();
    formData.append('file.name', blob);
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    this.httpClient.post('http://localhost:7001/design/upload/', formData, { headers: headers })
      .subscribe(r => console.log(r));

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = (e) => {
      // Base64 SVG
      console.log(reader.result);
    };
    const url = URL.createObjectURL(blob);
    this.imageBlobUrl = url;
    setTimeout(() => {
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.fillStyle = '#fff';
      this.context.fillRect(0, 0, this.width, this.height);
      this.context.drawImage(this.imageBg.nativeElement, 0, 0, this.width, this.height);
      this.context.drawImage(this.image.nativeElement, this.startX, this.startY, this.sizeX, this.sizeY);
      this.canvas.nativeElement.toBlob((b) => {
        console.log(b);
      }, 'image/png', 0.95);
      // const imgURI = this.canvas.nativeElement.toDataURL('image/png');
      // console.log(imgURI);
    }, 200);
  }

}

