import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { HttpClient } from "@angular/common/http"
import { CurrentUserInterface } from "../types/currentUser.interface";
import { environment } from "src/environments/environment";

@Injectable()
export class AuthService {
    currentUser$ = new BehaviorSubject<CurrentUserInterface | null | undefined>(undefined);
    constructor(private http: HttpClient) {}
    getCurrentUser():Observable<CurrentUserInterface> {
        const url = environment.apiUrl + '/user';
        return this.http.get<CurrentUserInterface>(url);
    }

    setCurrentUser(currentUser: CurrentUserInterface | null): void {
        this.currentUser$.next(currentUser);
    }
}