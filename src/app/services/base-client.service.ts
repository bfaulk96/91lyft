import {HttpHeaders} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AuthenticationToken} from "../../services/authentication-token.model";

@Injectable()
export class BaseClient {

  token: string = '';

  constructor() {
    const authenticationToken: AuthenticationToken = JSON.parse(localStorage.getItem(AuthenticationToken.STORAGE_KEY));
    if (authenticationToken != null && authenticationToken != undefined) {
      this.token = authenticationToken.authToken;
    }
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
