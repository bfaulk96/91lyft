export class AuthenticationToken {
  public static readonly STORAGE_KEY = "_authentication_token";

  public static isValid(rawAuthenticationToken: string): boolean {
    const authenticationToken = JSON.parse(rawAuthenticationToken);

    return true;
  }

  constructor() {
  }
}
