import {Component, OnInit} from '@angular/core';
import {IonicPage, NavController, ToastController} from 'ionic-angular';
import {AuthenticationService} from "../../services/authentication.service";
import {HomePage} from "../home/home";
import {MyApp} from "../../app/app";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage implements OnInit {
  username: string = "";
  password: string = "";

  app: any = MyApp;

  public constructor(private navController: NavController,
                     private authenticationService: AuthenticationService,
                     private toastController: ToastController) {
  }

  ngOnInit(): void {
  }

  login(): void {
    this.authenticationService.login(this.username, this.password).subscribe(
      (userLoginResponse: any): void => {
        console.log(userLoginResponse.response);

        this.navController.setRoot(HomePage);
        this.toastController.create({
          message: "Log in succeeded.",
          duration: 5000,
          showCloseButton: true,
          closeButtonText: "OK",
          cssClass: "toast-success"
        }).present();
      },
      (error: any) => {
        console.error(error.response);

        this.toastController.create({
          message: "Log in failed.",
          duration: 5000,
          showCloseButton: true,
          closeButtonText: "OK",
          cssClass: "toast-danger"
        }).present();
      }
    );
  }
}
