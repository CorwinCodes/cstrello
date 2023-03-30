import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { LoginRequestInterface } from "../../types/loginRequestInterface";

@Component({
    selector: 'auth-login',
    templateUrl: './login.component.html',
})
export class LoginComponent {
    errorMessage: string | null = null;
    form = this.fb.group({
        email: ['', Validators.required],
        password: ['', Validators.required],
    });
    constructor(private fb: FormBuilder, private authService: AuthService, private router:Router){}

    onSubmit():void {
        this.authService.login(this.form.value as LoginRequestInterface).subscribe({
            next: (currentUser) => {
                console.log('currentUser', currentUser)
                this.authService.setToken(currentUser);
                this.authService.setCurrentUser(currentUser);
                this.errorMessage = null;
                this.router.navigate(['/']) //could be more useful
            },
            error: (err: HttpErrorResponse) => {
                console.log('err', err.error);
                this.errorMessage = err.error.emailOrPassword;
            },
        })
    }
}