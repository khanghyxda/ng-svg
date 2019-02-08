import { PaintService } from './paint.service';
import { Component, OnInit, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PaintObjectType, getTemplate, parseLocalStorage, urlToBlob } from './paint.util';
import { fromEvent, Observable } from 'rxjs';
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

  template = <any>{};
  listDesign = [];
  listObject = [

  ];
  designInfos = <any>{};

  showFront = true;
  params = <any>{};

  constructor(private paintService: PaintService, private sanitizer: DomSanitizer, private httpClient: HttpClient) {
    this.paintService.removeSelectedAnnounced$.subscribe(() => {
      this.removeSelected();
    });
    this.paintService.cleanListAnnounced$.subscribe(() => {
      this.listObject = [];
      this.saveObj();
    });
    this.paintService.sendImageAnnounced$.subscribe((image) => {
      this.processingImage(image);
    });
    this.template = getTemplate(1);
    this.params.isDesign = true;
  }

  ngOnInit() {
    this.listDesign = parseLocalStorage('listDesign', []);
    this.listObject = this.listDesign[this.template.id] !== undefined ? this.listDesign[this.template.id]['listObject'] || [] : [];
    this.designInfos = this.listDesign[this.template.id] !== undefined ? this.listDesign[this.template.id]['designInfos'] || {} : {};
    console.log(this.listDesign);
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
          image: <any>{}, selected: false
        };
        const image = new Image();
        image.src = URL.createObjectURL(file);
        image.onload = () => {
          obj.image.width = image.width;
          obj.image.height = image.height;
          obj.image.src = image.src;
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
    this.listDesign[this.template.id] = {};
    this.listDesign[this.template.id]['listObject'] = this.listObject;
    this.listDesign[this.template.id]['designInfos'] = this.designInfos;
    localStorage.setItem('listDesign', JSON.stringify(this.listDesign));
  }

  designComplete() {
    this.designInfos.images = [];
    this.paintService.designComplete();
  }

  processingImage(image) {
    this.designInfos.images.push(image);
  }

  async upload() {
    const images: any[] = this.designInfos.images;
    for (const image of images) {
      image.svg = await urlToBlob(image.svgImage);
    }
    console.log(images);
    const formData: FormData = new FormData();
    images.forEach((image, index) => {
      const idSvg = this.template.id + '-svg-' + (image.isFront ? '1' : '2');
      const idPng = this.template.id + '-png-' + (image.isFront ? '1' : '2');
      formData.append(idSvg, image.svg);
      formData.append(idPng, image.svg);
    });
    formData.append('designInfos', JSON.stringify(this.designInfos));
    const headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    this.httpClient.post('http://localhost:7001/design/upload/', formData, { headers: headers })
      .subscribe(r => console.log(r));
  }

}

