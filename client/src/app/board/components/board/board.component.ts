import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { combineLatest, filter, map, Observable, Subject, Subscription, take, takeUntil } from 'rxjs';
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
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';


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
    unsubscribe$ = new Subject<void>();//note this is a subject so it doesn't have a value initially. using this with pipe take until to condense unsubscribing from listeners
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
        this.router.events
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(event => { //added a return for subscription instead of void so we can manage all of them with ng destroy on subscriptions
            if (event instanceof NavigationStart && !event.url.includes('/boards/')) { //added the and condition so that going to children wouldn't make us leave the board on the socket
                console.log('leaving page');
                this.boardService.leaveBoard(this.boardId);
            }
        });

        this.socketService
        .listen<ColumnInterface>(SocketEventsEnum.columnsCreateSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(column => {
            this.boardService.addColumn(column);
        });

        this.socketService
        .listen<TaskInterface>(SocketEventsEnum.tasksCreateSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(task => {
            this.boardService.addTask(task);
        });

        this.socketService
        .listen<BoardInterface>(SocketEventsEnum.boardsUpdateSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(updatedBoard => {
            this.boardService.updateBoard(updatedBoard);
        });

        this.socketService
        .listen<void>(SocketEventsEnum.boardsDeleteSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(() => {
            this.router.navigate(['/boards']);
        });
        
        this.socketService
        .listen<string>(SocketEventsEnum.columnsDeleteSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((columnId: string) => {
            this.boardService.deleteColumn(columnId);
        });

        this.socketService
        .listen<ColumnInterface>(SocketEventsEnum.columnsUpdateSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(updatedColumn => {
            this.boardService.updateColumn(updatedColumn);
        });

        this.socketService
        .listen<TaskInterface>(SocketEventsEnum.tasksUpdateSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(updatedTask => {
            this.boardService.updateTask(updatedTask);
        });

        this.socketService
        .listen<string>(SocketEventsEnum.tasksDeleteSuccess)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((taskId: string) => {
            this.boardService.deleteTask(taskId);
        });
    }

    fetchData(): void { //this logic could go in OnInit, but this is cleaner
        this.boardsService
        .getBoard(this.boardId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(board => {
            this.boardService.setBoard(board); //note the S on one of these services
        });
        
        this.columnsService
        .getColumns(this.boardId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(columns => {
            this.boardService.setColumns(columns); //colums belong to a specific board, so they're save on the board service with other data
        });

        this.tasksService
        .getTasks(this.boardId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(tasks => {
            this.boardService.setTasks(tasks); //colums belong to a specific board, so they're save on the board service with other data
        });
    }

    getTasksByColumn(columnId: string): TaskInterface[] { //created this filter to use with *ngFor in template
        return this.boardService.tasks$.getValue().filter(task => task.columnId === columnId).sort((a, b) => a.order - b.order); //sort the tasks by order
    }

    createColumn(title: string): void {
        const columnInput: ColumnInputInterface = {
            title,
            boardId: this.boardId,
        };
        this.columnsService.createColumn(columnInput);
    }

    updateColumnTitle(newTitle: string, columnId: string): void {
        this.columnsService.updateColumn(columnId, this.boardId, { title: newTitle});
    }

    createTask(title: string, columnId: string): void {
        const taskInput: TaskInputInterface = {
            title,
            columnId,
            boardId: this.boardId,
        };
        this.tasksService.createTask(taskInput);
    }

    updateBoardName(newBoardName: string): void {
        this.boardsService.updateBoard(this.boardId, { title: newBoardName });
    }

    deleteBoard(): void {
        if (confirm('Are you sure you want to DELETE this board and all its columns and tasks? It Can\'t be undone.')) {
            this.boardsService.deleteBoard(this.boardId);
        }
    }

    deleteColumn(columnId: string): void {
        if (confirm('Are you sure you want to DELETE this column and all its tasks? It Can\'t be undone.')) {
            this.columnsService.deleteColumn(this.boardId, columnId);
        }
    }

    deleteTask(taskId: string): void {
        if (confirm('Are you sure you want to DELETE this task? It Can\'t be undone.')) {
            this.tasksService.deleteTask(this.boardId, taskId);
        }
    }

    openTask(taskId: string): void {
        this.router.navigate(['boards', this.boardId, 'tasks', taskId])
    }


    trackById(index: number, item: { id: string }): string {
        return item.id;
    }

    getConnectedListIds(excludeId: string): Observable<string[]> { //those whole thing would be simpler without the combined stream, but oh well
        return this.data$.pipe(
          take(1),
          map((data) => data.columns),
          map((columns) => columns.map((column) => column.id)),
          map((columnIds) => columnIds.filter((id) => id !== excludeId))
        );
      }
      
      
    onTaskDrop(event: CdkDragDrop<any>) {
        const targetColumnId = event.container.id;
        const sourceColumnId = event.previousContainer.id;
        console.log('targetColumnId', targetColumnId);
        console.log('sourceColumnId', sourceColumnId);
        const targetColumnTasks = this.getTasksByColumn(targetColumnId);
        const sourceColumnTasks = this.getTasksByColumn(sourceColumnId);

        if (event.previousContainer === event.container) {
            // The task is moved within the same column
            moveItemInArray(targetColumnTasks, event.previousIndex, event.currentIndex);
        } else {
            // The task is moved to a different column
            transferArrayItem(
              sourceColumnTasks,
              targetColumnTasks,
              event.previousIndex,
              event.currentIndex
            );

            // Update columnId of the moved task on backend
            const movedTask = targetColumnTasks[event.currentIndex];
            movedTask.columnId = targetColumnId;
            this.updateTaskColumn(movedTask.id, movedTask.columnId);
        }

        // Update the order of tasks in the target column
        targetColumnTasks.forEach((task, index) => {
            if (task.order !== index) {
            task.order = index;
            this.updateTaskOrder(task.id, task.order);
                }
        });

        // If the task was moved to a different column, update the order of tasks in the source column as well
        if (event.previousContainer !== event.container) {
            sourceColumnTasks.forEach((task, index) => {
                if (task.order !== index) {
                    task.order = index;
                    this.updateTaskOrder(task.id, task.order);
                }
            });
        }
    }

    updateTaskColumn(taskId: string, newColumnId: string) {
        // Implement the logic to update the task's column in the backend
        console.log('-----------------------')
        console.log('taskId:', taskId);
        console.log('newColumnId', newColumnId);
        console.log('-----------------------')
        this.tasksService.updateTask(this.boardId, taskId, {columnId: newColumnId});
    }

    updateTaskOrder(taskId: string, newOrder: number) {
        // Implement the logic to update the task's order in the backend
        console.log('-----------------------')
        console.log('taskId:', taskId);
        console.log('newOrder', newOrder);
        console.log('-----------------------')
        this.tasksService.updateTask(this.boardId, taskId, {order: newOrder});
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();//emiting this value will unsubscribe all the listeners
        this.unsubscribe$.complete();//this will end our subscription to the stream itself
    }
}