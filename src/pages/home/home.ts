import {AgmMap} from '@agm/core';

import {HttpClient} from '@angular/common/http';
import {Component, OnInit} from '@angular/core';
import {Diagnostic} from '@ionic-native/diagnostic';
import {Geolocation} from '@ionic-native/geolocation';
import {LoadingController, NavController, ToastController} from 'ionic-angular';
import {GeoCodeLocation, GoogleMapsClient, LyftClient, RequestStatus, ResultsItemType, RideRequestParams, RideResponseParams, SwaggerException} from '../../app/app.api';
import {SocketClientService} from '../../app/services/socket-client.service';
import {AuthenticationService} from '../../services/authentication.service';
import {LoginPage} from '../login/login';
import {LyftLocationType} from "../../app/services/lyft-webhook.interface";

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
  urgentCareReady: boolean = false;
  rideRequested: boolean = false;
  rideStatus: string = "Please wait...";
  rideAccepted: boolean = false;
  driverLocation: LyftLocationType;

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
    this.socketService.onRideStatusUpdated().subscribe(
      (that: any) => {
        let lyftWebhookParams = that.webhookResponse;
        console.log(lyftWebhookParams);
        switch (lyftWebhookParams.event.status) {
          case RequestStatus.Accepted:
            this.rideAccepted = true;
            let lat = lyftWebhookParams.event.lat;
            let lng = lyftWebhookParams.event.lng;

            const allowable_distance = 0.15; // 10 miles
            // const this_distance = Math.random();

            this.driverLocation = {lat: lat, lng: lng, bearing: lyftWebhookParams.event.bearing};

            //0.15;
            // this.driverLocation.lat = 38.644726;
            // this.driverLocation.lng = -90.284863;

            console.log(this.driverLocation);

            break;
          default:
            break
        }
      }
    );
  }


  ionViewDidLoad() {
    this.setGeoLocation();
    this.getNearbyUrgentCare();
  }

  setGeoLocation() {
    this.geolocation.getCurrentPosition().then((position) => {
        this.currentLoc.lat = position.coords.latitude;
        this.currentLoc.lng = position.coords.longitude;
        this.googleMapReady = true;
        if (this.urgentCareReady) {
          this.rideStatus = "Request a Ride!";
        }
      },
      (err) => {
        //alert(err);
      });
  }

  getNearbyUrgentCare(): void {
    // this.googleMapsClient.getUrgentCares(new GeoCodeLocation({
    //   lat: this.currentLoc.lat,
    //   lng: this.currentLoc.lng
    // })).subscribe(
    //   (googlePlaceSearchResponse: GooglePlaceSearchResponse): void => {
    //     if (googlePlaceSearchResponse.results) {
    //       const closestResult = this.findClosestResult(googlePlaceSearchResponse.results);
    //       this.urgentCareLatLng = closestResult.geometry.location;
    //       this.urgentCareReady = true;
    //       if (this.googleMapReady) {
    //         this.rideStatus = "Request a Ride!";
    //       }
    //     }
    //   }
    // );

    this.urgentCareLatLng = {lat: this.currentLoc.lat - 0.15, lng: this.currentLoc.lng - 0.15};
    this.urgentCareReady = true;
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
    this.rideRequested = true;
    this.rideStatus = "Requesting a ride...";
    loadingInstance.present();

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
        this.rideStatus = "Awaiting driver acceptance...";
        loadingInstance.dismissAll();

        setTimeout(
          (): void => {
            console.log("accepting");
            this.lyftClient.updateLyftRideStatus(rideResponseParams.ride_id, RequestStatus.Accepted).subscribe(
              (): void => {
                console.log("update complete");
              }
            );
          },
          5000
        );
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
        this.rideStatus = "Request a ride!";
        loadingInstance.dismissAll();
      }
    );
  }

  logout(): void {
    this.authenticationService.logout();
    this.navController.setRoot(LoginPage);
  }
}
