import { Injectable } from "@angular/core";
import { BehaviorSubject, filter, map, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http"
import { CurrentUserInterface } from "../types/currentUser.interface";
import { environment } from "src/environments/environment";
import { RegisterRequestInterface } from "../types/registerRequest.interface";
import { LoginRequestInterface } from "../types/loginRequestInterface";
import { SocketService } from "src/app/shared/services/socket.service";
import { apiUrl } from "src/app/shared/urls";

@Injectable()
export class AuthService {
    currentUser$ = new BehaviorSubject<CurrentUserInterface | null | undefined>(undefined);
    isLoggedIn$ = this.currentUser$.pipe(
        filter((currentUser) => currentUser !== undefined),
        map(Boolean)
    );

    constructor(private http: HttpClient, private socketService: SocketService) {}
    
    register(registerRequest: RegisterRequestInterface): Observable<CurrentUserInterface> { //note proper typing of var and output
        const url = apiUrl + '/users';
        return this.http.post<CurrentUserInterface>(url, registerRequest);//still need to store token w/ set token method, not typingon post
    }

    login(loginRequest: LoginRequestInterface): Observable<CurrentUserInterface> {
        const url = apiUrl + '/users/login';
        return this.http.post<CurrentUserInterface>(url, loginRequest);
    }

    logout(): void {
        localStorage.removeItem('token');
        this.currentUser$.next(null);
        this.socketService.disconnect();
    }

    setToken(currentUser: CurrentUserInterface):void { //now this exists use it in submit on register component
        localStorage.setItem('token', currentUser.token)
    }

    getCurrentUser():Observable<CurrentUserInterface> {
        const url = apiUrl + '/user';
        return this.http.get<CurrentUserInterface>(url);
    }

    setCurrentUser(currentUser: CurrentUserInterface | null): void {
        this.currentUser$.next(currentUser);
    }
}