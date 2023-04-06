import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { SocketService } from "src/app/shared/services/socket.service";
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
    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router:Router,
        private socketService: SocketService,
    ){}

    onSubmit():void {
        this.authService.login(this.form.value as LoginRequestInterface).subscribe({
            next: (currentUser) => {
                console.log('currentUser', currentUser)
                this.authService.setToken(currentUser);
                this.authService.setCurrentUser(currentUser);
                this.socketService.setupSocketConnection(currentUser); //wasn't being established without an already stored token, this solves that
                this.errorMessage = null;
                this.router.navigate(['/'])
            },
            error: (err: HttpErrorResponse) => {
                console.log('err', err.error);
                this.errorMessage = err.error.emailOrPassword;
            },
        })
    }
}