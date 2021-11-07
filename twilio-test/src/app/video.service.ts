import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  public api = 'http://192.168.0.102:3000';

  constructor(private http: HttpClient) { }

  public getToken(identity: string): Observable<any> {
    return this.http.get<any>(`${this.api}/token?identity=${identity}`);
  }
}