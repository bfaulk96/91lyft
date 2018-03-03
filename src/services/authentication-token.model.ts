import {UserVm} from "../app/app.api";

export class AuthenticationToken {
  public static readonly STORAGE_KEY = "_authentication_token";

  public authToken: string;
  public user: UserVm;

  public static isValid(rawAuthenticationToken: string): boolean {
    const authenticationToken = JSON.parse(rawAuthenticationToken);

    return true;
  }

  constructor(authToken: string, user: UserVm) {
    this.authToken = authToken;
    this.user = user;
  }
}
