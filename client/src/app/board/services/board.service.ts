import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SocketService } from "src/app/shared/services/socket.service";
import { BoardInterface } from "src/app/shared/types/board.interface";
import { ColumnInterface } from "src/app/shared/types/column.interface";
import { SocketEventsEnum } from "src/app/shared/types/socketEvents.enum";
import { TaskInterface } from "src/app/shared/types/task.interface";

//basically state for a specific board page to hold streams and state
@Injectable()
export class BoardService {
    board$ = new BehaviorSubject<BoardInterface | null>(null);
    columns$ = new BehaviorSubject<ColumnInterface[]>([]);
    tasks$ = new BehaviorSubject<TaskInterface[]>([]);


    constructor(private socketService: SocketService) {}

    setBoard(board : BoardInterface): void {
        this.board$.next(board);
    }

    setColumns(columns: ColumnInterface[]): void {
        this.columns$.next(columns);
    }

    setTasks(tasks: TaskInterface[]): void {
        this.tasks$.next(tasks);
    }

    leaveBoard(boardId: string): void {
        this.board$.next(null);
        this.socketService.emit(SocketEventsEnum.boardsLeave, { boardId })
    }

    addColumn(column: ColumnInterface): void {
        this.columns$.next([...this.columns$.getValue(), column]);
    }

    updateColumn(updatedColumn: ColumnInterface): void {
        const updatedColumns = this.columns$.getValue().map((column) => {
            if (column.id === updatedColumn.id) {
                return { ...column, title: updatedColumn.title } //this maybe needs to be more generalized
            }
            return column
        });
        this.columns$.next(updatedColumns);
    }

    /* updateColumn(updatedColumn: ColumnInterface): void {
        const indexToReplace = this.columns$.getValue().findIndex(column => column.id === updatedColumn.id)
        if (indexToReplace === -1) {
            throw new Error('Column not found');
        }
        const updatedColumns = this.columns$.getValue()
        updatedColumns.splice(indexToReplace, 1, updatedColumn);
        this.columns$.next(updatedColumns);
    } */

    deleteColumn(columnId: string): void {
        const updatedColumns = this.columns$.getValue().filter(column => column.id !== columnId)
        this.columns$.next(updatedColumns);
    }

    addTask(task: TaskInterface): void {
        this.tasks$.next([...this.tasks$.getValue(), task]);
    }

    updateBoard(updatedBoard: BoardInterface): void {
        const board = this.board$.getValue();
        if (!board) {
            throw new Error('Board not initialized');
        }
        this.board$.next({ ...board, title: updatedBoard.title });
    }
}