import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent, SafeUrlPipe } from './app.component';
import { PaintControlComponent } from './paint-control/paint-control.component';
import { PaintTextComponent } from './paint-control/paint-text/paint-text.component';
import { PaintImageComponent } from './paint-control/paint-image/paint-image.component';
import { PaintContainerComponent } from './paint-control/paint-container/paint-container.component';
import { HomeComponent } from './home/home.component';
import { DesignComponent } from './design/design.component';
import { RouterModule, Routes } from '@angular/router';

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'design', component: DesignComponent },
  {
    path: '',
    redirectTo: '/design',
    pathMatch: 'full'
  },
];


@NgModule({
  declarations: [
    AppComponent,
    PaintControlComponent,
    PaintTextComponent,
    PaintImageComponent,
    SafeUrlPipe,
    PaintContainerComponent,
    HomeComponent,
    DesignComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes// <-- debugging purposes only
    )
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
