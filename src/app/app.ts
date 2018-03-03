import {Component, OnInit} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {AuthenticationService} from "../services/authentication.service";
import {LoginPage} from "../pages/login/login";
import {HomePage} from "../pages/home/home";

@Component({
  selector: "app-root",
  templateUrl: './app.html',
  providers: []
})
export class MyApp implements OnInit {
  // rootPage: any = LandingPage;
  static readonly USING_BROWSER = true;
  static readonly MAPS_API_KEY = 'AIzaSyD3FgRTJxRDFpFgYWvrbQ9RpgITNs1KgvY';
  rootPage: any = LoginPage;

  constructor(private platform: Platform,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private authenticationService: AuthenticationService,) {
    platform.ready().then(
      (): void => {
        statusBar.styleDefault();
        splashScreen.hide();
      }
    );

    if (authenticationService.isLoggedIn) {
      this.rootPage = HomePage
    }
  }

  ngOnInit(): void {
  }
}

