import { PaintService } from './paint.service';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PaintObjectType, getTemplate } from './common.util';
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

  template = {};
  listObject = [

  ];

  showFront = true;
  params = <any>{};

  constructor(private paintService: PaintService, private sanitizer: DomSanitizer, private httpClient: HttpClient) {
    this.paintService.removeSelectedAnnounced$.subscribe(() => {
      this.removeSelected();
    });
    this.template = getTemplate(1);
    this.params.isDesign = true;
  }

  ngOnInit() {
    // this.listObject = JSON.parse(localStorage.getItem('listObject'));
  }

  ngAfterViewInit(): void {
    const down = fromEvent(document, 'mousedown')
      .pipe();
    down.subscribe((md) => {
      this.removeSelected();
    });
  }

  removeSelected() {
    this.listObject.forEach(element => {
      element.selected = false;
    });
  }

  clickChooseFile(event) {
    event.target.value = '';
  }

  addText() {
    const obj = { isFront: this.showFront, type: PaintObjectType.text, text: 'TEST', image: null, selected: false };
    this.listObject.push(obj);
  }

  onFileChanged(event) {
    const file = event.target.files[0];
    if (file != null) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = (e) => {
        const obj = {
          isFront: this.showFront, type: PaintObjectType.image, text: null,
          image: <any>{ base64: reader.result }, selected: false
        };
        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          obj.image.width = image.width;
          obj.image.height = image.height;
          this.listObject.push(obj);
          console.log(obj);
        };
      };

    }
  }

  preview() {
    this.params.isDesign = false;
    this.paintService.preview();
  }

  design() {
    this.params.isDesign = true;
    this.paintService.design();
  }

  saveObj() {
    localStorage.setItem('listObject', JSON.stringify(this.listObject));
  }

}

