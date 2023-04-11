import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { combineLatest, filter, map, Observable, Subscription } from 'rxjs';
import { BoardsService } from 'src/app/shared/services/boards.service';
import { ColumnsService } from 'src/app/shared/services/columns.service';
import { SocketService } from 'src/app/shared/services/socket.service';
import { BoardInterface } from 'src/app/shared/types/board.interface';
import { ColumnInterface } from 'src/app/shared/types/column.interface';
import { SocketEventsEnum } from 'src/app/shared/types/socketEvents.enum';
import { BoardService } from '../../services/board.service';
import { ColumnInputInterface } from 'src/app/shared/types/columnInput.interface';
import { TasksService } from 'src/app/shared/services/tasks.service';
import { TaskInterface } from 'src/app/shared/types/task.interface';
import { TaskInputInterface } from 'src/app/shared/types/taskInput.interace';

@Component({
    selector: 'board',
    templateUrl: './board.component.html',
})
export class BoardComponent implements OnInit, OnDestroy {
    boardId: string;
    data$: Observable<{
        board: BoardInterface;
        columns: ColumnInterface[];
        tasks: TaskInterface[];
    }>;
    subscriptions = new Subscription;
    constructor(
        private boardsService: BoardsService,
        private route: ActivatedRoute,
        private router: Router,
        private boardService: BoardService,
        private socketService: SocketService,
        private columnsService: ColumnsService,
        private tasksService: TasksService,
    ) {
        const boardId = this.route.snapshot.paramMap.get('boardId'); //id is grabbed in constructor and subjected to if check to throw error before assignment so that we can be certain board id is initialized as a string
        if (!boardId) {
            throw new Error(`Can't get boardID from url`);
        }
        this.boardId = boardId;

        this.data$ = combineLatest([
            this.boardService.board$.pipe(filter(Boolean)), //standard way to ensure the stream is filtered of initial null values before informing the observable here
            this.boardService.columns$,
            this.boardService.tasks$,
        ]).pipe(map(([board, columns, tasks]) => ({ //destructuring from the combined streams here, order is important
            board,
            columns,
            tasks,
        })) //now we have mapped the data as an object for the cleaner data$ stream
        );
    }

    ngOnInit(): void {
        this.socketService.emit(SocketEventsEnum.boardsJoin, {
            boardId: this.boardId,
        }); //note using enum instead of string for better safety, see types for socket events enum
        this.fetchData();
        this.initializeListeners();
    }
    
    initializeListeners(): void {
        const initializeListenersNavSub = this.router.events.subscribe(event => { //added a return for subscription instead of void so we can manage all of them with ng destroy on subscriptions
            if (event instanceof NavigationStart) {
                console.log('leaving page');
                this.boardService.leaveBoard(this.boardId);
            }
        });
        this.subscriptions.add(initializeListenersNavSub);

        const initializeListenersCreateColumnSuccessSub = this.socketService
        .listen<ColumnInterface>(SocketEventsEnum.columnsCreateSuccess)
        .subscribe(column => {
            this.boardService.addColumn(column);
        });
        this.subscriptions.add(initializeListenersCreateColumnSuccessSub);

        const initializeListenersCreateTaskSuccessSub = this.socketService
        .listen<TaskInterface>(SocketEventsEnum.tasksCreateSuccess)
        .subscribe(task => {
            this.boardService.addTask(task);
        });
        this.subscriptions.add(initializeListenersCreateTaskSuccessSub);
    }

    fetchData(): void { //this logic could go in OnInit, but this is cleaner
        const getBoardSub = this.boardsService.getBoard(this.boardId).subscribe(board => {
            this.boardService.setBoard(board); //note the S on one of these services
        });
        this.subscriptions.add(getBoardSub);
        
        const getColumnsSub = this.columnsService.getColumns(this.boardId).subscribe(columns => {
            this.boardService.setColumns(columns); //colums belong to a specific board, so they're save on the board service with other data
        });
        this.subscriptions.add(getColumnsSub);

        const getTasksSub = this.tasksService.getTasks(this.boardId).subscribe(tasks => {
            this.boardService.setTasks(tasks); //colums belong to a specific board, so they're save on the board service with other data
        });
        this.subscriptions.add(getTasksSub);
    }

    getTasksByColumn(columnId: string, tasks: TaskInterface[]): TaskInterface[] { //created this filter to use with *ngFor in template
        return tasks.filter(task => task.columnId == columnId);
    }

    createColumn(title: string): void {
        const columnInput: ColumnInputInterface = {
            title,
            boardId: this.boardId,
        };
        this.columnsService.createColumn(columnInput);
    }

    createTask(title: string, columnId: string): void {
        const taskInput: TaskInputInterface = {
            title,
            columnId,
            boardId: this.boardId,
        };
        this.tasksService.createTask(taskInput);
    }

    ngOnDestroy(): void {
        if(this.subscriptions){
            this.subscriptions.unsubscribe();
        }
    }
}