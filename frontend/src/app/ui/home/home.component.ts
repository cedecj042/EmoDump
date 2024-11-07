import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NavComponent } from '../nav/nav.component';
import { User } from '../../shared/interfaces/User';
import { EmotionsComponent } from './emotions/emotions.component';
import { FeedsComponent } from './feeds/feeds.component';
import { DumpComponent } from './dump/dump.component';
import { DumpService } from '../../shared/services/dump.service';
import { Dumps } from '../../shared/interfaces/Dumps';
import { NgClass, NgIf } from '@angular/common';
@Component({
  selector: 'app-home',
  standalone: true,
  providers:[AuthService,{provide: Window, useValue: window}],
  imports: [
    RouterModule,
    MatSnackBarModule,
    NavComponent,
    FeedsComponent,
    EmotionsComponent,
    DumpComponent,
    NgClass,
    NgIf
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  currentUser!:User;
  dumps?:Dumps;
  canvasSize: { width: number, height: number } = { width: 0, height: 0 };
  constructor(
    private Auth: AuthService,
    private router: Router,
    private dumpService: DumpService,
    private cdRef: ChangeDetectorRef
  ) { }
  ngOnInit(): void {
    this.dumpService.currentDump.subscribe(dumps =>{
        this.dumps =dumps;
    })
    this.Auth.getCurrentUser().subscribe({
      next:response=>{
        this.currentUser ={
          id:response.id,
          username:response.username,
          first_name:response.first_name,
          last_name:response.last_name,
          email:response.email,
          password:response.password,
          profile_image:response.profile_image,
          birthdate:response.birthdate,
          gender:response.gender
        }
      }
      ,error:error=>{
        console.log("Response has failed")
        localStorage.clear();
        this.router.navigateByUrl('/login')
      }
      ,complete:()=>{
        console.log("Response has completed")
      }
    })
  }
}
