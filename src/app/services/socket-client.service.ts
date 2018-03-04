import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import * as io from 'socket.io-client';

@Injectable()
export class SocketClientService {

    private socket: SocketIOClient.Socket;
    private rideId: string;
    private nameSpace: string;
    private nameSpaceSub: ReplaySubject<string> = new ReplaySubject<string>();
    nameSpaceObs = this.nameSpaceSub.asObservable();
    private rideIdSub: ReplaySubject<string> = new ReplaySubject<string>();
    rideIdObs = this.rideIdSub.asObservable();

    constructor() {
        // this.socket = io.connect('https://server-91lyft.herokuapp.com/');
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

    getNameSpace1(namespace: string) {
        this.nameSpaceSub.next(namespace);
    }

    getNameSpace2(namespace: string) {
        this.nameSpace = namespace;
    }

    onRideStatusUpdated() {
        this.socket = io(`/${this.nameSpace}`);
        return new Observable(observer => {
            this.socket.on(`ride.status.updated`, data => {
                observer.next(data);
            });
        });
    }
}