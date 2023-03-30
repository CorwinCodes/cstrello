import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../services/auth.service";
import { RegisterRequestInterface } from "../../types/registerRequest.interface";

@Component({
    selector: 'auth-register',
    templateUrl: './register.component.html',
})
export class RegisterComponent {
    errorMessage: string | null = null;
    form = this.fb.group({
        email: ['', Validators.required],
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    constructor(private fb: FormBuilder, private authService: AuthService, private router:Router){} //inject auth service to register

    onSubmit():void { //note that register returns an observable so we subscribe
        
        this.authService.register(this.form.value as RegisterRequestInterface).subscribe({ //note this typing was necessary because form values include null by default
            next: (currentUser) => {
                console.log('currentUser', currentUser) //see this in the console so we can use it to store token and set user for client
                this.authService.setToken(currentUser);
                this.authService.setCurrentUser(currentUser);
                this.errorMessage = null;
                this.router.navigate(['/'])
            },
            error: (err: HttpErrorResponse) => { //we know the error type, so we type it here ||| we can use this error on template for error messages
                console.log('err', err.error); //since we typed it we know we can add the .error to err
                this.errorMessage = err.error.join(', '); //we know from looking at controllers on server that erros are string[], so join works
            },
        })
    }
}