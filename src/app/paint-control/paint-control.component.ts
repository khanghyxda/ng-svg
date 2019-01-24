import { PaintService } from './paint.service';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PaintObjectType } from './common.util';
import { fromEvent } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';


@Component({
  selector: 'app-paint-control',
  templateUrl: './paint-control.component.html',
  styleUrls: ['./paint-control.component.css'],
  providers: [PaintService]
})
export class PaintControlComponent implements OnInit, AfterViewInit {

  @ViewChild('control') control: ElementRef;
  @Input('width') width: number;
  @Input('height') height: number;
  imageUrl;

  listObject = [
    { type: PaintObjectType.image, link: 'https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png', selected: false },
    { type: PaintObjectType.image, link: 'https://mdn.mozillademos.org/files/6457/mdn_logo_only_color.png', selected: false },
    // { type: PaintObjectType.text, text: 'SVG TEST' },
  ];

  constructor(private paintService: PaintService, private sanitizer: DomSanitizer) {
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
  }

  removeSelected() {
    this.listObject.forEach(element => {
      element.selected = false;
    });
  }

  svgToBase64() {
    const svg = new XMLSerializer().serializeToString(this.control.nativeElement);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
  }

}

