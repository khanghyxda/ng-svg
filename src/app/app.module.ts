import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { SvgControlComponent } from './svg-control/svg-control.component';
import { PaintControlComponent } from './paint-control/paint-control.component';
import { PaintObjectComponent } from './paint-control/paint-object/paint-object.component';

@NgModule({
  declarations: [
    AppComponent,
    SvgControlComponent,
    PaintControlComponent,
    PaintObjectComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
