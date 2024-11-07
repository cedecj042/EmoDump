import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './ui/home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { PageNotFoundComponent } from './ui/page-not-found/page-not-found.component';
import { AuthGuardService } from './shared/guards/auth-guard.service';
import { LoginGuardService } from './shared/guards/login-guard.service';

export const routes: Routes = [
    {path:'login',component:LoginComponent,canActivate:[LoginGuardService]},  
    {path:'register',component:RegisterComponent,canActivate:[LoginGuardService]},  
    {path:'home',component:HomeComponent, canActivate:[AuthGuardService]}, 
    {path:'logout',component:LogoutComponent, canActivate:[AuthGuardService]},
    {path:'**',component:PageNotFoundComponent}
];
