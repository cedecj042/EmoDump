import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { Credentials } from '../../../shared/interfaces/Credentials';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login-form',
  standalone: true,
  providers: [AuthService],
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    RouterModule,
    MatSnackBarModule
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.css'
})

export class LoginFormComponent implements OnInit {
  loginForm!: FormGroup;
  user!: Credentials;
  cookies!: string;
  saved!: Boolean;

  constructor(private fb: FormBuilder, private router: Router, private Auth: AuthService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [
        Validators.required
      ]],
      password: ['', [
        Validators.required,
        Validators.pattern('^[\\w\\d\\s]{8,}$')
      ]]
    })
  }
  getUsername() {
    return this.loginForm.get('username');
  }
  getPassword() {
    return this.loginForm.get('password');
  }

  submit() {
    this.user = {
      username: this.getUsername()?.value,
      password: this.getPassword()?.value
    }
    console.log(this.user)
    this.Auth.login(this.user).subscribe({
      next: response => {
        localStorage.setItem('accessToken', response.access);
        localStorage.setItem('refreshToken', response.refresh);
        console.log('Response received')
      },
      error: error => {
        console.log(error)
        console.log("Response has failed")
        this.loginForm.get('username')?.setErrors({ userNotExists: true });
        this.loginForm.get('password')?.setErrors({ userNotExists: true });
      },
      complete: () => {
        this.snackBar.open('Login successful!', 'Close', {
          duration: 10000, // Duration for which the alert will be displayed (in milliseconds)
        });
        this.router.navigate(['/home'])
      }
    })
  }


}
