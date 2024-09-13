import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private userSource = new BehaviorSubject({});
  userInfo = this.userSource.asObservable();

  private loginSource = new BehaviorSubject({});
  loginInfo = this.loginSource.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  updateUser(info: object) {
    this.userSource.next(info)
  }

  updateLoginStatus(info) {
    this.loginSource.next(info)
  }

}
