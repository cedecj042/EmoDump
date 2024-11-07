import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.css'
})
export class LogoutComponent implements OnInit{
  isLogout!:boolean;
  constructor(private auth:AuthService,private snackbar:MatSnackBar,private route:Router){}
  ngOnInit(): void {
    this.auth.logout().subscribe({
      next: response =>{
        console.log(response)
        this.isLogout = true;
      },error: error=>{
        console.log(error)
        this.route.navigate(['/login'])
      },complete: ()=>{
        localStorage.clear();
        if(this.isLogout){
          this.snackbar.open('Redirecting to login', 'Close', {
          duration: 5000,
        })
        this.route.navigate(['/login'])
        }
      }
    })
  }
}
