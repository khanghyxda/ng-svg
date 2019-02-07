import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaintService {

  private removeSelectedAnnouncedSource = new Subject();
  private previewAnnouncedSource = new Subject();
  private designAnnouncedSource = new Subject();

  removeSelectedAnnounced$ = this.removeSelectedAnnouncedSource.asObservable();
  previewAnnounced$ = this.previewAnnouncedSource.asObservable();
  designAnnounced$ = this.previewAnnouncedSource.asObservable();

  removeSelected() {
    this.removeSelectedAnnouncedSource.next();
  }

  preview() {
    this.previewAnnouncedSource.next();
  }

  design() {
    this.designAnnouncedSource.next();
  }

  constructor() { }
}
