import {Component, OnInit} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {HomePage} from '../pages/home/home';
import {LandingPage} from "../pages/landing/landing";

@Component({
  selector: "app-root",
  templateUrl: './app.html',
})
export class MyApp implements OnInit {
  rootPage: any = HomePage;
  // rootPage: any = LandingPage;
  static readonly USING_BROWSER = true;
  static readonly MAPS_API_KEY = 'AIzaSyD3FgRTJxRDFpFgYWvrbQ9RpgITNs1KgvY';

  constructor(private platform: Platform,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen) {
    platform.ready().then(
      (): void => {
        statusBar.styleDefault();
        splashScreen.hide();
      }
    );
  }

  ngOnInit(): void {
  }
}

