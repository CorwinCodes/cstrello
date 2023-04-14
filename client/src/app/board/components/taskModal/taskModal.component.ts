import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, combineLatest, filter, map, takeUntil } from 'rxjs';
import { TaskInterface } from 'src/app/shared/types/task.interface';
import { BoardService } from '../../services/board.service';
import { ColumnInterface } from 'src/app/shared/types/column.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TasksService } from 'src/app/shared/services/tasks.service';

@Component({
    selector: 'task-modal',
    templateUrl: './taskModal.component.html',
})
export class TaskModalComponent implements OnDestroy{
    @HostBinding('class') classes = 'task-modal';

    boardId: string;
    taskId: string;
    task$: Observable<TaskInterface>;
    data$: Observable<{task: TaskInterface, columns: ColumnInterface[]}>;
    columnForm = this.fb.group({
        columnId: '',
    });
    unsubscribe$ = new Subject<void>();

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private boardService: BoardService,
        private fb: FormBuilder,
        private tasksService: TasksService
    ) {
        const taskId = this.route.snapshot.paramMap.get('taskId');
        const boardId = this.route.parent?.snapshot.paramMap.get('boardId');
        if (!boardId) {
            throw new Error("Can't get boardID from URL")
        }
        if (!taskId) {
            throw new Error("Can't get taskID from URL")
        }
        this.boardId = boardId;
        this.taskId = taskId;
        this.task$ = this.boardService.tasks$.pipe(
            map((tasks) => {
                return tasks.find((task) => task.id === this.taskId); //get a single task by id from the tasks list
            }),
            filter(Boolean) //eliminate undefined or null
        );
        this.data$ = 
            combineLatest([this.task$, this.boardService.columns$])
            .pipe(map(([task, columns]) => {
                return {task, columns};
            }))
        ;

        this.task$
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((task) => {
            this.columnForm.patchValue({ columnId: task.columnId}) //this is why the value is certainly not null in the below columnForm.get call
        });

        combineLatest([
            this.task$,
            this.columnForm.get<string>('columnId')!.valueChanges, //without the <string> and assert ! on ('columnId') typescript won't accept this because it's possibly null, but it's certain to have a value
        ]) //using combine latest because we need to exclude reacting to non-changes regarding the existing task column assignment
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(([task, columnId]) => {
            if (task.columnId !== columnId) {
                this.tasksService.updateTask(this.boardId, task.id, { columnId })
            }
        })
    }

    goToBoard() {
        this.router.navigate(['boards', this.boardId]);
    }
    updateTaskName(newTaskName: string): void {
        this.tasksService.updateTask(this.boardId, this.taskId, {title: newTaskName});
    }

    updateTaskDescription(newTaskDescription: string): void {
        console.log('updateTaskDescription', newTaskDescription)
        this.tasksService.updateTask(this.boardId, this.taskId, {description: newTaskDescription});
    }

    deleteTask(): void {
        this.tasksService.deleteTask(this.boardId, this.taskId);
        this.goToBoard();
    }

    ngOnDestroy(): void {
        this.unsubscribe$.next();
        this.unsubscribe$.complete();
    }
}