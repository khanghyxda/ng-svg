import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-paint-control',
  templateUrl: './paint-control.component.html',
  styleUrls: ['./paint-control.component.css']
})
export class PaintControlComponent implements OnInit {

  @ViewChild('control') control: ElementRef;
  @Input('width') width: number;
  @Input('height') height: number;
  controlSvg;

  listObject = [
    { 'type': PaintObjectType.image },
    { 'type': PaintObjectType.image },
    { 'type': PaintObjectType.image }
  ];

  constructor() {
  }

  ngOnInit() {
    this.controlSvg = this.control;
  }

}

enum PaintObjectType {
  text,
  image
}
