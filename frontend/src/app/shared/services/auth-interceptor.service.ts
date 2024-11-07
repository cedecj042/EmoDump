import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router:Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `JWT ${accessToken}`
        }
      });
    }
    return next.handle(request).pipe(
      catchError(error => {
        console.error('Error occurred:', error);
        return throwError(error); // Rethrow the error so it can be caught downstream
      }),
      tap(event => {
        if (event instanceof HttpResponse) {
          if (request.url === 'http://localhost:8000/api/login') {
            const newAccessToken = event.headers.get('accessToken'); 
            const newRefreshToken = event.headers.get('accessToken'); 
            if (newAccessToken) {
              if(newRefreshToken){
                localStorage.setItem('accessToken', newAccessToken);
                localStorage.setItem('refreshToken', newAccessToken);
              }
            }
          }
          if (request.url === 'http://localhost:8000/api/logout') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      })
    );
  }
}