import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { environment } from "../../environments/environment";
import { AuthData } from "./auth-data.model";

const BACKEND_URL = environment.apiUrl + "/user/";

@Injectable({ providedIn: "root" })
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any; //timer
  private userId: string;
  private authStatusListener = new Subject<boolean>();//new subject imported from rxjs, use this ot push the authentication infor to the components which are interested (we will use it in the interceptor)

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {// use this method wether the user is authenticatd -can be used in the post-list.componnent
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId; // get userId from post-list.component
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };//from auth-data.model
    this.http
      .post(BACKEND_URL + "/signup", authData)
      .subscribe(() => {
        this.router.navigate(["auth/login"]); //addded this to redirect new user to login page
      }, error => {
        this.authStatusListener.next(false); // error handling to remove spinner with invalid credentials
      });
  }

  login(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string; expiresIn: number, userId: string  }>(//token from the backend user routes
        BACKEND_URL + "/login",
        authData
      )
      .subscribe(response => {
        const token = response.token;
        this.token = token;//storing token in the service, to be used in adding, deleting and updating post
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authStatusListener.next(true);// informing everyone that our user is authenticated
          const now = new Date(); // create date of the moment
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          console.log(expirationDate);
          this.saveAuthData(token, expirationDate, this.userId);
          this.router.navigate(["/"]);//navigate user to homepage after login
        }
      }, error => {
        this.authStatusListener.next(false); //error handling - invalid email/pw
      });
  }

  autoAuthUser() { //try to automatically authenticate the user if we got the info for it on oulr local storage
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date(); //current date time
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime(); //deducting timestamps in expiration date/time and current time
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);//user not authenticated anymore
    this.userId = null;
    clearTimeout(this.tokenTimer); // clear timer when logout
    this.clearAuthData(); //to clear local storage
    this.router.navigate(["/"]);//navigate user to homepage after logout
  }

  private setAuthTimer(duration: number) {
    console.log("Setting timer: " + duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem("token", token); //(key, value))
    localStorage.setItem("expiration", expirationDate.toISOString()); //clear idea when the token expires
    localStorage.setItem("userId", userId);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
  }

  private getAuthData() { // called in autoAuthUser
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId"); //to retreive from local storage
    if (!token || !expirationDate) {
      return; //return nothing
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }
}
