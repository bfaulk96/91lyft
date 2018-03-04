import {Component, OnInit} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {AuthenticationService} from "../services/authentication.service";
import {LoginPage} from "../pages/login/login";
import {HomePage} from "../pages/home/home";
import {Diagnostic} from "@ionic-native/diagnostic";

@Component({
  selector: "app-root",
  templateUrl: './app.html',
  providers: []
})
export class MyApp implements OnInit {
  // rootPage: any = HomePage;
  // rootPage: any = LandingPage;
  static readonly USING_BROWSER = true;
  rootPage: any = LoginPage;

  constructor(private platform: Platform,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private authenticationService: AuthenticationService,
              private diagnostic: Diagnostic) {
    platform.ready().then(
      (): void => {
        statusBar.styleDefault();
        splashScreen.hide();

        if (!MyApp.USING_BROWSER) {
          diagnostic.getLocationAuthorizationStatus().then((status) => {
            if (status === this.diagnostic.permissionStatus.GRANTED ||
              status === this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE) {
              console.log("location enabled")
            } else {
              diagnostic.requestLocationAuthorization().then((): void => {})
            }
          });
        }
      }
    );

    if (authenticationService.isLoggedIn) {
      this.rootPage = HomePage
    }
  }

  ngOnInit(): void {
  }
}
