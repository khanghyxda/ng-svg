import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaintService {

  private removeSelectedAnnouncedSource = new Subject();
  private previewAnnouncedSource = new Subject();
  private designAnnouncedSource = new Subject();
  private cleanListAnnouncedSource = new Subject();

  removeSelectedAnnounced$ = this.removeSelectedAnnouncedSource.asObservable();
  previewAnnounced$ = this.previewAnnouncedSource.asObservable();
  designAnnounced$ = this.previewAnnouncedSource.asObservable();
  cleanListAnnounced$ = this.cleanListAnnouncedSource.asObservable();

  removeSelected() {
    this.removeSelectedAnnouncedSource.next();
  }

  preview() {
    this.previewAnnouncedSource.next();
  }

  design() {
    this.designAnnouncedSource.next();
  }

  cleanList() {
    this.cleanListAnnouncedSource.next();
  }

  constructor() { }
}
