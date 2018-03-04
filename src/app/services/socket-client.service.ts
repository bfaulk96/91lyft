import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import * as io from 'socket.io-client';

@Injectable()
export class SocketClientService {

    private socket: SocketIOClient.Socket;
    private rideIdSub: Subject<string> = new Subject<string>();
    rideInObs = this.rideIdSub.asObservable();

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
        return new Observable(observer => {
            this.socket.on(`ride.status.updated_${rideId}`, data => {
                observer.next(data);
            });
        });
    }
}