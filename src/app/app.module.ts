import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent, SafeUrlPipe } from './app.component';
import { PaintControlComponent } from './paint-control/paint-control.component';
import { PaintTextComponent } from './paint-control/paint-text/paint-text.component';
import { PaintImageComponent } from './paint-control/paint-image/paint-image.component';
import { PaintContainerComponent } from './paint-control/paint-container/paint-container.component';

@NgModule({
  declarations: [
    AppComponent,
    PaintControlComponent,
    PaintTextComponent,
    PaintImageComponent,
    SafeUrlPipe,
    PaintContainerComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
