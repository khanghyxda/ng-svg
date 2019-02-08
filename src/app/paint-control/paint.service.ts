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
  private designCompleteAnnouncedSource = new Subject();
  private sendImageAnnouncedSource = new Subject<IImage>();
  private deleteObjectAnnouncedSource = new Subject<String>();

  removeSelectedAnnounced$ = this.removeSelectedAnnouncedSource.asObservable();
  previewAnnounced$ = this.previewAnnouncedSource.asObservable();
  designAnnounced$ = this.previewAnnouncedSource.asObservable();
  cleanListAnnounced$ = this.cleanListAnnouncedSource.asObservable();
  designCompleteAnnounced$ = this.designCompleteAnnouncedSource.asObservable();
  sendImageAnnounced$ = this.sendImageAnnouncedSource.asObservable();
  deleteObjectAnnounced$ = this.deleteObjectAnnouncedSource.asObservable();

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

  designComplete() {
    this.designCompleteAnnouncedSource.next();
  }

  sendImage(image: IImage) {
    this.sendImageAnnouncedSource.next(image);
  }

  deleteObject(id) {
    this.deleteObjectAnnouncedSource.next(id);
  }

  constructor() {

  }
}

export class IImage {

  public svgImage;

  public pngImage;

  public isFront;

}
