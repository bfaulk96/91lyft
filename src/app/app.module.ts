import { AgmCoreModule } from '@agm/core';
import { HttpClientModule } from '@angular/common/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AgmDirectionModule } from 'agm-direction';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HomePage } from '../pages/home/home';
import { LandingPage } from '../pages/landing/landing';
import { LoginPage } from '../pages/login/login';
import { LoginPageModule } from '../pages/login/login.module';
import { AuthenticationService } from '../services/authentication.service';
import { MyApp } from './app';
import { API_BASE_URL, GoogleMapsClient, LyftClient, UserClient } from './app.api';
import { SocketClientService } from './services/socket-client.service';
import { InAppBrowser } from '@ionic-native/in-app-browser';

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
        InAppBrowser,
        LocationAccuracy,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        {provide: API_BASE_URL, useFactory: baseUrl},
        AuthenticationService,
        UserClient,
        GoogleMapsClient,
        SocketClientService,
        LyftClient
    ]
})

export class AppModule {
}

export function baseUrl(): string {
    return `https://server-91lyft.herokuapp.com/api`;
}
