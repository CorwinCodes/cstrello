import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ColumnInterface } from '../types/column.interface';
import { ColumnInputInterface } from '../types/columnInput.interface';
import { SocketService } from '../services/socket.service'
import { SocketEventsEnum } from '../types/socketEvents.enum';
import { apiUrl } from '../urls';

@Injectable()
export class ColumnsService {
    constructor(private http: HttpClient, private socketService: SocketService) {}

    getColumns(boardId: string): Observable<ColumnInterface[]> {
        const url = `${apiUrl}/boards/${boardId}/columns`;
        return this.http.get<ColumnInterface[]>(url);
    }

    createColumn(columnInput: ColumnInputInterface): void {
        this.socketService.emit(SocketEventsEnum.columnsCreateStart, columnInput);
    }

    updateColumn(columnId: string, boardId: string, fields: {title: string}): void {
        this.socketService.emit(SocketEventsEnum.columnsUpdateStart, { columnId, boardId, fields });
    }

    deleteColumn(boardId: string, columnId: string): void {
        this.socketService.emit(SocketEventsEnum.columnsDeleteStart, { boardId, columnId });
    }
}