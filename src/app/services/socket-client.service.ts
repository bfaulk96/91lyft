import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';

@Injectable()
export class SocketClientService {

    private socket: SocketIOClient.Socket;

    constructor() {
        this.socket = io.connect('https://server-91lyft.herokuapp.com/');
    }

    emitEvent(event: string) {
        this.socket.emit(event);
    }

    onRideStatusUpdated() {
        return new Observable(observer => {
            this.socket.on('ride.status.updated', data => {
                observer.next(data);
            });
        });
    }
}