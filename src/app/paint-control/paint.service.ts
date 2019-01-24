import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaintService {

  private removeSelectedAnnouncedSource = new Subject();

  removeSelectedAnnounced$ = this.removeSelectedAnnouncedSource.asObservable();

  removeSelected() {
    this.removeSelectedAnnouncedSource.next();
  }

  constructor() { }
}
