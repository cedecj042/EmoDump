import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
    constructor(private router: Router) {}

    canActivate: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
        let loggedIn=localStorage.getItem('refreshToken');

        if (!loggedIn) { 
            console.log("true")
            this.router.navigate(['/login']);
            return false
        }
        return true;
    }
}