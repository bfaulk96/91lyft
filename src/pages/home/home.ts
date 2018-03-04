import { AgmMap } from '@agm/core';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Geolocation } from '@ionic-native/geolocation';
import { AlertController, LoadingController, NavController, Platform, ToastController } from 'ionic-angular';
import { last } from 'rxjs/operators';
import {
    GeoCodeLocation,
    GoogleMapsClient,
    GooglePlaceSearchResponse,
    LyftClient,
    RequestStatus,
    ResultsItemType,
    RideRequestParams,
    RideResponseParams,
    SwaggerException
} from '../../app/app.api';
import { DriverType, EventType, LyftLocationType, VehicleType } from '../../app/services/lyft-webhook.interface';
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
    googleMapReady: boolean = false;
    urgentCareReady: boolean = false;
    rideRequested: boolean = false;
    rideStatus: string = 'Please wait...';
    rideAccepted: boolean = false;
    driverLocation: LyftLocationType;
    driverEvent: EventType;
    driver: DriverType;
    vehicle: VehicleType;
    amount: string;
    private platform: Platform;
    showLyftDetails: boolean = false;

    constructor(private navController: NavController,
                private diagnostic: Diagnostic,
                private geolocation: Geolocation,
                private http: HttpClient,
                private authenticationService: AuthenticationService,
                private googleMapsClient: GoogleMapsClient,
                private lyftClient: LyftClient,
                private socketService: SocketClientService,
                private loadingController: LoadingController,
                private toastController: ToastController,
                private pf: Platform,
                private alertCtrl: AlertController) {
        this.platform = pf;
    }

    ngOnInit(): void {
        this.socketService.onRideStatusUpdated()
            .pipe(last())
            .subscribe(
                (lyftWebhookParamsWrapper: any) => {
                    console.log(lyftWebhookParamsWrapper);
                    let lyftWebhookParams = lyftWebhookParamsWrapper.webhookResponse;
                    switch (lyftWebhookParams.event.status) {
                        case RequestStatus.Accepted:
                            this.rideAccepted = true;
                            let lat = lyftWebhookParams.event.location.lat;
                            let lng = lyftWebhookParams.event.location.lng;

                            // Max radius in distance that the lyft driver can spawn at.
                            const allowable_distance = 0.15; // 10 miles

                            // The distances from the origin. These two points WILL fall on the radius defined above.
                            let lat_dist = Math.random() * allowable_distance;
                            let lng_dist = Math.sqrt(Math.pow(allowable_distance, 2) - Math.pow(lat_dist, 2));

                            // Scale the lat and long towards the origin by a random amount or potentially 0.
                            lat_dist *= Math.random();
                            lng_dist *= Math.random();

                            // Now randomly negate the lat or long to allow for placement in any of the four quadrants.
                            lat_dist *= Math.random() >= 0.5 ? 1 : -1;
                            lng_dist *= Math.random() >= 0.5 ? 1 : -1;

                            // Add these values to the origin value to randomly position the Lyft driver around the user within the allowed_distance miles.
                            this.driverLocation = {lat: lat + lat_dist, lng: lng + lng_dist, bearing: undefined};

                            this.driverEvent = lyftWebhookParams.event;
                            this.amount = ((11 + Math.random() * 10) + Math.random()).toFixed(2);
                            this.driver = this.driverEvent.driver;
                            this.vehicle = this.driverEvent.vehicle;

                            this.toastController.create({
                                message: 'Your ride has been accepted!',
                                duration: 5000,
                                showCloseButton: true,
                                closeButtonText: 'OK',
                                cssClass: 'toast-success',
                                position: 'top',
                            }).present();

                            break;
                        default:
                            break;
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
                    this.rideStatus = 'Request a Ride';
                }
            },
            (err) => {
                //alert(err);
            });
    }

    getNearbyUrgentCare(): void {
        this.googleMapsClient.getUrgentCares(new GeoCodeLocation({
            lat: this.currentLoc.lat,
            lng: this.currentLoc.lng
        }), true).subscribe(
            (googlePlaceSearchResponse: GooglePlaceSearchResponse): void => {
                if (googlePlaceSearchResponse.results) {
                    const closestResult = this.findClosestResult(googlePlaceSearchResponse.results);
                    this.urgentCareLatLng = closestResult.geometry.location;
                    this.urgentCareReady = true;
                    if (this.googleMapReady) {
                        this.rideStatus = 'Request a Ride';
                    }
                }
            }
        );
        // this.urgentCareLatLng = {lat: this.currentLoc.lat - 0.15, lng: this.currentLoc.lng - 0.15};
        // this.urgentCareReady = true;
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

    presentConfirm() {
        let alert = this.alertCtrl.create({
            title: 'Confirm action',
            message: 'Are you sure you want to request a ride? This will cost money.',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Yes',
                    handler: () => {
                        console.log('Yes clicked');
                        this.callARide();
                    }
                }
            ]
        });
        alert.present();
    }

    confirmLogout() {
        let alert = this.alertCtrl.create({
            title: 'Confirm action',
            message: 'Are you sure you want to log out?',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    handler: () => {
                        console.log('Cancel clicked');
                    }
                },
                {
                    text: 'Log out',
                    handler: () => {
                        console.log('Yes clicked');
                        this.logout();
                    }
                }
            ]
        });
        alert.present();
    }

    callARide(): void {
        const loadingInstance = this.loadingController.create({
            spinner: 'dots',
            content: 'Submitting ride request...',
            showBackdrop: true,
            enableBackdropDismiss: false,
            dismissOnPageChange: false
        });
        this.rideRequested = true;
        this.rideStatus = 'Requesting a ride...';
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
                    message: 'Your ride has been requested!',
                    duration: 5000,
                    showCloseButton: true,
                    closeButtonText: 'OK',
                    cssClass: 'toast-success',
                    position: 'top',
                }).present();
                this.rideStatus = 'Awaiting driver acceptance...';
                loadingInstance.dismissAll();

                setTimeout(
                    (): void => {
                        console.log('accepting');
                        this.lyftClient.updateLyftRideStatus(rideResponseParams.ride_id, RequestStatus.Accepted).subscribe(
                            (): void => {
                                console.log('update complete');
                            }
                        );
                    },
                    8000
                );
            },
            (error: SwaggerException): void => {
                console.error(error.response);
                this.toastController.create({
                    message: 'Your ride failed to be requested. Please try again.',
                    duration: 5000,
                    showCloseButton: true,
                    closeButtonText: 'OK',
                    cssClass: 'toast-danger',
                    position: 'top',
                }).present();
                this.rideRequested = false;
                this.rideStatus = 'Request a ride!';
                loadingInstance.dismissAll();
            }
        );
    }

    calculateSavings(): number {
        return 600 - Math.ceil(Number(this.amount));
    }

    displayAmbulanceInfo(): void {
        this.toastController.create({
            message: 'Ambulance rates start at around $600. Good choice going with Lyft!',
            duration: 7000,
            showCloseButton: true,
            closeButtonText: 'OK',
            cssClass: 'toast-lyft',
            position: 'middle',
        }).present();
    }

    logout(): void {
        this.authenticationService.logout();
        this.navController.setRoot(LoginPage);
    }
}
