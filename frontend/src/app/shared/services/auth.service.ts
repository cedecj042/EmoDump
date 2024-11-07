import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../interfaces/User';
import { Credentials } from '../interfaces/Credentials';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) { }
  getURL(){
    return this.apiUrl;
  }
  register(user: User): Observable<Boolean> {
    return this.http.post<any>(`${this.apiUrl}/auth/users/`, user);
  }
  login(credentials: Credentials): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/login`, credentials);
  }
  logout(): Observable<any>  {
    const token = {'refresh':localStorage.getItem('refreshToken')};
    const body = JSON.stringify(token)
    return this.http.post(this.apiUrl+"/api/logout",token);
  }


  // verifyToken():Observable<any>{
  //   const token = localStorage.getItem('accessToken');
  //   return this.http.post(this.apiUrl+"/api/token/verify",token);
  // }
  // refreshToken():Observable<any>{
  //   const token = localStorage.getItem('refreshToken');
  //   return this.http.post(this.apiUrl+"/api/token/refresh",token);
  // }
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accesstoken');
  }
  getCurrentUser(): Observable<any> {
    return this.http.get(this.apiUrl+"/auth/users/me/");
  }
}
