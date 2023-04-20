import { Injectable } from '@angular/core';
import { CurrentUserInterface } from 'src/app/auth/types/currentUser.interface';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { Socket } from 'socket.io-client/build/esm/socket';
import { Observable } from 'rxjs';
import { socketUrl } from '../urls';

@Injectable()
export class SocketService {
    socket: Socket | undefined;
    setupSocketConnection(currentUser: CurrentUserInterface): void {
        this.socket = io(socketUrl, {
            auth: {
                token: currentUser.token,
            },
        });
    }

    disconnect(): void {
        if(!this.socket) {
            throw new Error('Socket connection not established');
        }
        this.socket.disconnect();
    }

    emit(eventName: string, message: any): void {
        if(!this.socket) {
            throw new Error('Socket connection not established');
        }
        this.socket.emit(eventName, message);
    }

    listen<T>(eventName: string): Observable<T> {
        const socket = this.socket; //just done to get around a typescript error where the if condition isn't properly accounted for
        if(!socket) {
            throw new Error('Socket connection not established');
        }
        return new Observable((subscriber) => {
            socket.on(eventName, (data) => {
                subscriber.next(data);
            });
        });
    }
    //ex:
    //listen<string>('column:createSuccess').subscribe(res)
    //makes socket events update an observable so that it works well with angular
}