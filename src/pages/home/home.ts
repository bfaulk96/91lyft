import {AgmMap} from '@agm/core';

import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {Diagnostic} from '@ionic-native/diagnostic';
import {Geolocation} from '@ionic-native/geolocation';
import {LoadingController, NavController, ToastController} from 'ionic-angular';
import {GeoCodeLocation, GoogleMapsClient, GooglePlaceSearchResponse, LyftClient, ResultsItemType, RideRequestParams, RideResponseParams, SwaggerException} from '../../app/app.api';
import {SocketClientService} from '../../app/services/socket-client.service';
import {AuthenticationService} from '../../services/authentication.service';
import {LoginPage} from '../login/login';

@Component({
  selector: 'page-home',
  templateUrl: './home.html',
})
export class HomePage implements OnInit {
  // @ViewChild('map') mapElement: ElementRef;
  map: AgmMap = null;
  currentLoc: { lat: number, lng: number } = {lat: 38.63144, lng: -90.19319};
  urgentCareLatLng: { lat: number, lng: number } = {lat: this.currentLoc.lat, lng: this.currentLoc.lng};
  zoom: number = 14;
  displayMap: boolean = false;
  googleMapReady: boolean = false;
  rideRequested: boolean = false;
  rideStatus: string = "Please wait...";

  constructor(private navController: NavController,
              private diagnostic: Diagnostic,
              private geolocation: Geolocation,
              private http: HttpClient,
              private authenticationService: AuthenticationService,
              private googleMapsClient: GoogleMapsClient,
              private lyftClient: LyftClient,
              private socketService: SocketClientService,
              private loadingController: LoadingController,
              private toastController: ToastController) {
  }

  ngOnInit(): void {
    this.socketService.onRideStatusUpdated()
      .subscribe((data) => {
        console.log(data);
      });
  }


  ionViewDidLoad() {
    this.setGeoLocation();
    this.getNearbyUrgentCare();
  }

  setGeoLocation() {
    this.geolocation.getCurrentPosition().then((position) => {
      this.currentLoc.lat = position.coords.latitude;
      this.currentLoc.lng = position.coords.longitude;
      this.displayMap = true;
    }, (err) => {
      alert(err);
    });
  }

  getNearbyUrgentCare(): void {
    this.googleMapsClient.getUrgentCares(new GeoCodeLocation({
      lat: this.currentLoc.lat,
      lng: this.currentLoc.lng
    })).subscribe(
      (googlePlaceSearchResponse: GooglePlaceSearchResponse): void => {
        if (googlePlaceSearchResponse.results) {
          const closestResult = this.findClosestResult(googlePlaceSearchResponse.results);
          this.urgentCareLatLng = closestResult.geometry.location;
          this.googleMapReady = true;
          this.rideStatus = "Call a Ride!";
        }
      }
    );
  }

  findClosestResult(results: Array<ResultsItemType>): ResultsItemType {
    let closestDistance = Infinity;
    let closestResult = results[0];

    results.forEach(
      (result: ResultsItemType): void => {
        const currentDistance = Math.abs(this.currentLoc.lat - result.geometry.location.lat) + Math.abs(this.currentLoc.lng - result.geometry.location.lng);
        if (currentDistance < closestDistance) {
          closestDistance = currentDistance;
          closestResult = result;
        }
      }
    );

    return closestResult;
  }

  callARide(): void {
    const loadingInstance = this.loadingController.create({
      spinner: "dots",
      content: "Submitting ride request...",
      showBackdrop: true,
      enableBackdropDismiss: false,
      dismissOnPageChange: false
    });
    loadingInstance.present();
    this.rideRequested = true;

    this.lyftClient.lyftRideRequest(
      new RideRequestParams({
        origin: new GeoCodeLocation({
          lat: this.currentLoc.lat,
          lng: this.currentLoc.lng
        }),
        destination: new GeoCodeLocation({
          lat: this.urgentCareLatLng.lat,
          lng: this.urgentCareLatLng.lng
        }),
        ride_type: 'lyft'
      })
    ).subscribe(
      (rideResponseParams: RideResponseParams): void => {
        console.log(rideResponseParams);
        this.toastController.create({
          message: "Your ride has been requested!",
          duration: 5000,
          showCloseButton: true,
          closeButtonText: "OK",
          cssClass: "toast-success"
        }).present();
        this.rideStatus= "Ride requested, awaiting driver acceptance...";
      },
      (error: SwaggerException): void => {
        console.error(error.response);
        this.toastController.create({
          message: "Your ride failed to be requested. Please try again.",
          duration: 5000,
          showCloseButton: true,
          closeButtonText: "OK",
          cssClass: "toast-danger"
        }).present();
        this.rideRequested = false;
      },
      (): void => {
        loadingInstance.dismissAll();
      }
    );
  }

  logout(): void {
    this.authenticationService.logout();
    this.navController.setRoot(LoginPage);
  }
}

// 839964606160592302
