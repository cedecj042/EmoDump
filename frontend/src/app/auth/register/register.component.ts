import { NgClass, NgStyle } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule,MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../../shared/interfaces/User';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import * as LR from "@uploadcare/blocks";
import "@uploadcare/blocks/web/lr-file-uploader-minimal.min.css";
LR.registerBlocks(LR);

type Image = {
  cdnUrl:string;
  uuid:string;
  name:string;
}
@Component({
  selector: 'app-register',
  standalone: true,
  providers: [AuthService],
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    NgStyle,
    NgClass,
    RouterModule,
    MatSnackBarModule
  ],
  schemas:[CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  @ViewChild('ctxProvider') ctxProvider!: ElementRef<HTMLElement & {
    addEventListener(
      type: 'change',
      listener: (this: HTMLElement, ev: CustomEvent) => any,
      options?: boolean | AddEventListenerOptions
    ): void;
  }>;
  registerForm!: FormGroup
  visibility = false
  new_user!: User
  saved: Boolean = false;
  uploadedFiles:Image={
    cdnUrl:'https://ucarecdn.com/',
    uuid:'',
    name:''
  }; 
  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService,private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.pattern('^[\\w\\d\\s]{8,}$')
      ]],
      firstname: ['', [
        Validators.required
      ]],
      lastname: ['', [
        Validators.required
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      birthdate: [null, []],
      gender: [null, [
        Validators.pattern('(M|F)')
      ]],
    })
  }

  ngAfterViewInit(): void {
    if (this.ctxProvider && this.ctxProvider.nativeElement) {
      this.ctxProvider.nativeElement.addEventListener('change', this.handleUploadEvent.bind(this));
    }
  }

  
  getUsername() {
    return this.registerForm.get('username');
  }
  getPassword() {
    return this.registerForm.get('password');
  }
  getFirstName() {
    return this.registerForm.get('firstname');
  }
  getLastName() {
    return this.registerForm.get('lastname');
  }
  getBirthdate() {
    return this.registerForm.get('birthdate');
  }
  getGender() {
    return this.registerForm.get('gender');
  }
  getProfileImage() {
    return this.registerForm.get('profileImage');
  }
  getEmail() {
    return this.registerForm.get('email')
  }

  resetInput() {
    const input = document.getElementById('avatar-input-file') as HTMLInputElement;
    if (input) {
      input.value = "";
    }
  }

  registerUser() {
    this.new_user = {
      username: this.getUsername()?.value,
      first_name: this.getFirstName()?.value,
      last_name: this.getLastName()?.value,
      email: this.getEmail()?.value,
      password: this.getPassword()?.value,
      profile_image: this.uploadedFiles.uuid,
      birthdate: this.getBirthdate()?.value,
      gender: this.getGender()?.value
    }
    this.auth.register(this.new_user).subscribe({
      next: response => {
        console.log('Response Received')
        console.log(response)
        this.saved = response
      },
      error: error => { 
        console.log("Response has failed")
        this.handleError(error)
      },
      complete: () => {
        console.log('Response has completed');
        if (this.saved) {
          this.snackBar.open('Registration successful!', 'Close', {
            duration: 3000, // Duration for which the alert will be displayed (in milliseconds)
          });
          this.router.navigate(['/login']);
        }
      }
    })
  }
  handleError(error: any): void {
    if (error.status === 400 && error.error) {
      const errorMsg: { username?: string[], email?: string[] } = error.error;
  
      if (errorMsg.username) {
        this.registerForm.get('username')?.setErrors({ usernameExists: true });
        this.snackBar.open(`Error: ${errorMsg.username.join(', ')}`, 'Close', {
          duration: 5000,
        });
      }
  
      if (errorMsg.email) {
        this.registerForm.get('email')?.setErrors({ emailExists: true });
        this.snackBar.open(`Error: ${errorMsg.email.join(', ')}`, 'Close', {
          duration: 5000,
        });
      }
  
      if (!errorMsg.username && !errorMsg.email) {
        this.snackBar.open('Unknown error occurred. Please try again.', 'Close', {
          duration: 5000,
        });
      }
    } else {
      this.snackBar.open('Server error occurred. Please try again later.', 'Close', {
        duration: 5000,
      });
    }
  }
  handleUploadEvent(event: CustomEvent): void {
    const file = event.detail;
    this.uploadedFiles={
      cdnUrl:'https://ucarecdn.com/',
      uuid:'',
      name:''
    }
    if(file.isSuccess){
      if(file.totalCount===1){
        const uuid = file.allEntries[0].uuid;
        const name = file.allEntries[0].name;
        this.uploadedFiles.uuid = uuid + '/';
        this.uploadedFiles.name = name;
      }
    }
  }
}
