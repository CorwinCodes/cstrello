import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BoardComponent } from './components/board/board.component';
import { AuthGuardService } from '../auth/services/auth-guard.service';
import { BoardService } from './services/board.service';

const routes: Routes = [
    {
        path: 'boards/:boardId',
        component: BoardComponent,
        canActivate: [AuthGuardService],
    },
]

@NgModule({
    declarations: [BoardComponent],
    imports: [ CommonModule, RouterModule.forChild(routes) ],
    exports: [],
    providers: [BoardService],
})
export class BoardModule {}