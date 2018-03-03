import {Component, OnInit} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Geolocation} from '@ionic-native/geolocation';
import {AgmMap} from "@agm/core";
import {Diagnostic} from '@ionic-native/diagnostic';
import {MyApp} from "../../app/app";

import {HttpClient} from "@angular/common/http";
import {AuthenticationService} from "../../services/authentication.service";
import {LoginPage} from "../login/login";

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
  // center: LatLngLiteral;
  // markers: any;
  // mapOptions: any;
  // meters: any = 10000;
  // directionsService = new google.maps.DirectionsService;
  // directionsDisplay = new google.maps.DirectionsRenderer;

  constructor(private navController: NavController,
              private diagnostic: Diagnostic,
              private geolocation: Geolocation,
              private http: HttpClient,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit(): void {
  }


  ionViewDidLoad() {
    if (!MyApp.USING_BROWSER) {
      this.diagnostic.getLocationAuthorizationStatus().then((status) => {
        if (status === this.diagnostic.permissionStatus.GRANTED ||
          status === this.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE) {
          this.setGeoLocation();
        } else {
          alert("Location must be enabled to use this app.");
          this.diagnostic.switchToLocationSettings();
        }
      });
    } else {
      this.setGeoLocation();
      this.getNearbyUrgentCare().then((): void => {
        this.displayMap = true;
      }, (error: Error): void => {
        console.error(error);
      });
    }
  }

  setGeoLocation() {
    this.geolocation.getCurrentPosition().then((position) => {
      this.currentLoc.lat = position.coords.latitude;
      this.currentLoc.lng = position.coords.longitude;
    }, (err) => {
      alert(err);
    });
  }

  getNearbyUrgentCare(): Promise<boolean> {
    return new Promise<boolean>(
      (resolve: Function, reject: Function): void => {
        const queryString: string = "query=urgent care&key=" + MyApp.MAPS_API_KEY + "&location=" +
          this.currentLoc.lat + "," + this.currentLoc.lng + "&radius=50000&opennow=true";
        this.http.get<any>("https://maps.googleapis.com/maps/api/place/textsearch/json?" + queryString)
          .subscribe((data): void => {
              if (data.results) {
                const closestResult = this.findClosestResult(data.results);
                this.urgentCareLatLng = closestResult.geometry.location;
                resolve(true);
              } else {
                resolve(false);
              }
            }, (error: Error): void => {
              console.error(error);
              reject();
            }
          );
      }
    );
  }

  findClosestResult(results: Array<any>): any {
    let closestDistance = Infinity;
    let closestResult = results[0];

    results.forEach(
      (result: any, i: number): void => {
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
  }

  logout(): void {
    this.authenticationService.logout();
    this.navController.setRoot(LoginPage);
  }

  // loadMap(){
  //   this.geolocation.getCurrentPosition().then((position) => {
  //     let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  //     console.log('latLng', latLng);
  //     this.mapOptions = {
  //       center: this.latLng,
  //       zoom: 14,
  //       mapTypeId: google.maps.MapTypeId.ROADMAP
  //     };
  //     this.map = new google.maps.Map(this.mapElement.nativeElement, this.mapOptions);
  //     this.directionsDisplay.setMap(this.map);
  //     this.calculateAndDisplayRoute(this.latLng, "urgent care")
  //   }, (err) => {
  //     alert('err ' + err);
  //   });
  //
  // }
  //
  // calculateAndDisplayRoute(start, end) {
  //   this.directionsService.route({
  //     origin: start,
  //     destination: end,
  //     travelMode: google.maps.TravelMode.DRIVING
  //   }, (response, status) => {
  //     if (status === 'OK') {
  //       this.directionsDisplay.setDirections(response);
  //     } else {
  //       alert('Directions request failed due to ' + status);
  //     }
  //   });
  // }
}
