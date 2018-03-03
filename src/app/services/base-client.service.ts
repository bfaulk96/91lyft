import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class BaseClient {

    token: string = '';

    constructor() {
    }

    public transformOptions(options: any): any {
        if (this.token) {
            const headers = <HttpHeaders>options.headers;
            options.headers = headers.append('Authorization', this.token);
        }

        return new Promise(resolve => {
            resolve(options);
        });
    }

}
