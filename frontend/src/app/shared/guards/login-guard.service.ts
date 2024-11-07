import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class LoginGuardService {
    constructor(private router: Router) {}

    canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        let loggedIn=localStorage.getItem('refreshToken');

        if (loggedIn) { 
            this.router.navigate(['/home']);
            return false
        }
        return true;
    }
}