import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import * as io from 'socket.io-client';

@Injectable()
export class SocketClientService {

    private socket: SocketIOClient.Socket;
    private rideId: string;
    private rideIdSub: ReplaySubject<string> = new ReplaySubject<string>();
    rideIdObs = this.rideIdSub.asObservable();

    constructor() {
        this.socket = io.connect('https://server-91lyft.herokuapp.com/');
    }

    emitEvent(event: string) {
        this.socket.emit(event);
    }

    getRideId2(rideId: string) {
        this.rideIdSub.next(rideId);
    }

    getRideId1(rideId: string) {
        this.rideId = rideId;
    }

    onRideStatusUpdated() {
        return new Observable(observer => {
            this.socket.on(`ride.status.updated_${this.rideId}`, data => {
                observer.next(data);
            });
        });
    }
}