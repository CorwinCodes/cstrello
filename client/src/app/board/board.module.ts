import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { AuthGuardService } from '../auth/services/auth-guard.service';
import { BoardService } from './services/board.service';
import { ColumnsService } from '../shared/services/columns.service';
import { TasksService } from '../shared/services/tasks.service';
import { TopBarModule } from '../shared/modules/topBar/topBar.module';
import { InlineFormModule } from "../shared/modules/inlineForm/inlineForm.module";
import { TaskModalComponent } from './components/taskModal/taskModal.component';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
    {
        path: 'boards/:boardId',
        component: BoardComponent,
        canActivate: [AuthGuardService],
        children: [
            {
                path: 'tasks/:taskId',
                component: TaskModalComponent,
            }
        ],
    },
]

@NgModule({
    declarations: [BoardComponent, TaskModalComponent],
    exports: [],
    providers: [BoardService, ColumnsService, TasksService],
    imports: [CommonModule, RouterModule.forChild(routes), TopBarModule, InlineFormModule, ReactiveFormsModule]
})
export class BoardModule {}