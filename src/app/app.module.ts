import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {Geolocation} from '@ionic-native/geolocation';
import {MyApp} from './app';
import {HomePage} from '../pages/home/home';
import {AgmCoreModule} from '@agm/core';
import {Diagnostic} from '@ionic-native/diagnostic';
import {HttpClientModule} from "@angular/common/http";
import {AgmDirectionModule} from 'agm-direction';
import {LandingPage} from "../pages/landing/landing";
import {LocationAccuracy} from "@ionic-native/location-accuracy";
import {AuthenticationService} from "../services/authentication.service";
import {LoginPage} from "../pages/login/login";
import {LoginPageModule} from "../pages/login/login.module";
import { API_BASE_URL } from './app.api';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LandingPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD3FgRTJxRDFpFgYWvrbQ9RpgITNs1KgvY'
    }),
    AgmDirectionModule,
    LoginPageModule
  ],
  bootstrap: [
    IonicApp
  ],
  entryComponents: [
    MyApp,
    HomePage,
    LandingPage,
    LoginPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Diagnostic,
    LocationAccuracy,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
        {provide: API_BASE_URL, useFactory: baseUrl},
    AuthenticationService
  ]
})
export class AppModule {
}

export function baseUrl(): string {
    return `https://server-91lyft.herokuapp.com/api`;
}