import { Component, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) { }
  transform(value) {
    return this.sanitized.bypassSecurityTrustUrl(value);
  }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ng-svg';
  constructor() {
    const designTemplates = [
      {
        id: 1,
        width: 400, height: 400,
        paintWidth: 160, paintHeight: 240,
        paintWidthIn: 8, paintHeightIn: 12,
        startX: 120, startY: 100,
        imageBgFront: '/assets/front.png', imageBgBack: '/assets/back.png',
      }
    ];
    localStorage.setItem('designTemplates', JSON.stringify(designTemplates));
  }

}
