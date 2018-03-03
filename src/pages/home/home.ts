import {Component, OnInit} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Geolocation} from '@ionic-native/geolocation';
import {AgmMap} from "@agm/core";
import {Diagnostic} from '@ionic-native/diagnostic';

import {HttpClient} from "@angular/common/http";
import {AuthenticationService} from "../../services/authentication.service";
import {LoginPage} from "../login/login";
import {GeoCodeLocation, GoogleMapsClient, GooglePlaceSearchResponse, ResultsItemType} from "../../app/app.api";

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

  constructor(private navController: NavController,
              private diagnostic: Diagnostic,
              private geolocation: Geolocation,
              private http: HttpClient,
              private authenticationService: AuthenticationService,
              private googleMapsClient: GoogleMapsClient) {
  }

  ngOnInit(): void {
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
    this.googleMapsClient.getUrgentCares(new GeoCodeLocation({lat: this.currentLoc.lat, lng: this.currentLoc.lng})).subscribe(
      (data: GooglePlaceSearchResponse): void => {
        console.log(this.currentLoc);
        console.log(data);
        if (data.results) {
          const closestResult = this.findClosestResult(data.results);
          this.urgentCareLatLng = closestResult.geometry.location;
        }
      }
    );
  }

  findClosestResult(results: Array<ResultsItemType>): ResultsItemType {
    let closestDistance = Infinity;
    let closestResult = results[0];

    results.forEach(
      (result: ResultsItemType, i: number): void => {
        const currentDistance = Math.abs(this.currentLoc.lat - result.geometry.location.lat) + Math.abs(this.currentLoc.lng - result.geometry.location.lng);
        console.log(currentDistance);
        console.log(result);
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
}
