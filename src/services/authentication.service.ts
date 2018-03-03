import {EventEmitter, Injectable} from "@angular/core";
import {AuthenticationToken} from "./authentication-token.model";

@Injectable()
export class AuthenticationService {
  loggedInStatus: EventEmitter<boolean> = new EventEmitter<boolean>();
  isLoggedIn: boolean = false;

  public constructor() {
    const rawAuthenticationToken = localStorage.getItem(AuthenticationToken.STORAGE_KEY);
    if (rawAuthenticationToken != undefined && rawAuthenticationToken != "undefined" && rawAuthenticationToken != null && rawAuthenticationToken != "null") {
      console.log(rawAuthenticationToken);
      if (AuthenticationToken.isValid(rawAuthenticationToken)) {
        this.loggedInStatus.emit(true);
        this.isLoggedIn = true;
      } else {
        localStorage.setItem(AuthenticationToken.STORAGE_KEY, undefined);
        this.loggedInStatus.emit(false);
        this.isLoggedIn = false;
      }
    } else {
      localStorage.setItem(AuthenticationToken.STORAGE_KEY, undefined);
      this.loggedInStatus.emit(false);
      this.isLoggedIn = false;
    }
  }

  public login(username: string, password: string): boolean {
    localStorage.setItem(AuthenticationToken.STORAGE_KEY, JSON.stringify(new AuthenticationToken()));
    this.loggedInStatus.emit(true);
    this.isLoggedIn = true;
    return true;
  }

  public logout(): void {
    localStorage.setItem(AuthenticationToken.STORAGE_KEY, undefined);
    this.loggedInStatus.emit(false);
    this.isLoggedIn = false;
  }
}
