import { AgmMap } from '@agm/core';

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';
import { NavController } from 'ionic-angular';
import {
    GeoCodeLocation,
    GoogleMapsClient,
    GooglePlaceSearchResponse,
    LyftClient,
    ResultsItemType,
    RideRequestParams,
    RideResponseParams
} from '../../app/app.api';
import { SocketClientService } from '../../app/services/socket-client.service';
import { AuthenticationService } from '../../services/authentication.service';
import { LoginPage } from '../login/login';

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
                private googleMapsClient: GoogleMapsClient,
                private lyftClient: LyftClient,
                private socketService: SocketClientService) {
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
            },
            (error: Error): void => {
                console.error(error);
            }
        );
    }

    logout(): void {
        this.authenticationService.logout();
        this.navController.setRoot(LoginPage);
    }
}
