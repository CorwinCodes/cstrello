import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SocketService } from '../services/socket.service'
import { SocketEventsEnum } from '../types/socketEvents.enum';
import { TaskInterface } from '../types/task.interface';
import { TaskInputInterface } from '../types/taskInput.interace';

@Injectable()
export class TasksService {
    constructor(private http: HttpClient, private socketService: SocketService) {}

    getTasks(boardId: string): Observable<TaskInterface[]> {
        const url = `${environment.apiUrl}/boards/${boardId}/tasks`;
        return this.http.get<TaskInterface[]>(`${url}?sort=columnId,order`); //back-end is splitting sort commands on comma ",""
    }

    createTask(taskInput: TaskInputInterface): void {
        this.socketService.emit(SocketEventsEnum.tasksCreateStart, taskInput);
    }

    updateTask(boardId: string, taskId: string, fields: {title?: string; description?: string; columnId?: string; order?: number;}): void {
        this.socketService.emit(SocketEventsEnum.tasksUpdateStart, {
            boardId,
            taskId,
            fields,
        });
    }

    deleteTask(boardId: string, taskId: string): void {
        this.socketService.emit(SocketEventsEnum.tasksDeleteStart, { boardId, taskId });
    }
}