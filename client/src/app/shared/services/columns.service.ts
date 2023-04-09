import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ColumnInterface } from '../types/column.interface';

@Injectable()
export class ColumnsService {
    constructor(private http: HttpClient) {}

    getColumns(boardId: string): Observable<ColumnInterface[]> {
        const url = `${environment.apiUrl}/boards/${boardId}/columns`;
        return this.http.get<ColumnInterface[]>(url);
    }
}