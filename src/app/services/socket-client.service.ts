import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class SocketClientService {

    private socket: SocketIOClient.Socket;
    private rideId: string;
    private rideIdSub: BehaviorSubject<string> = new BehaviorSubject<string>('');
    rideIdObs = this.rideIdSub.asObservable();

    constructor() {
        this.socket = io.connect('https://server-91lyft.herokuapp.com/');
    }

    emitEvent(event: string) {
        this.socket.emit(event);
    }

    getRideId(rideId: string) {
        this.rideIdSub.next(rideId);
    }

    onRideStatusUpdated(rideId: string) {
        console.log(rideId);
        return new Observable(observer => {
            this.socket.on(`ride.status.updated_${rideId}`, data => {
                observer.next(data);
            });
        });
    }
}