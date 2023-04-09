import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SocketService } from "src/app/shared/services/socket.service";
import { BoardInterface } from "src/app/shared/types/board.interface";
import { ColumnInterface } from "src/app/shared/types/column.interface";
import { SocketEventsEnum } from "src/app/shared/types/socketEvents.enum";

//basically state for a specific board page to hold streams and state
@Injectable()
export class BoardService {
    board$ = new BehaviorSubject<BoardInterface | null>(null);
    columns$ = new BehaviorSubject<ColumnInterface[]>([]);

    constructor(private socketService: SocketService) {}

    setBoard(board : BoardInterface): void {
        this.board$.next(board);
    }

    setColumns(columns: ColumnInterface[]): void {
        this.columns$.next(columns);
    }

    leaveBoard(boardId: string): void {
        this.board$.next(null);
        this.socketService.emit(SocketEventsEnum.boardsLeave, { boardId })
    }
}