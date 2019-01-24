import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PaintControlComponent } from './paint-control/paint-control.component';
import { PaintTextComponent } from './paint-control/paint-text/paint-text.component';
import { PaintImageComponent } from './paint-control/paint-image/paint-image.component';

@NgModule({
  declarations: [
    AppComponent,
    PaintControlComponent,
    PaintTextComponent,
    PaintImageComponent,
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
