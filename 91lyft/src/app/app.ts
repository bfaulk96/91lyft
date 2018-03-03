import {Component, OnInit} from '@angular/core';
import {Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {HomePage} from '../pages/home/home';

@Component({
  selector: "app-root",
  templateUrl: './app.html',
})
export class MyApp implements OnInit {
  rootPage: any = HomePage;

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

