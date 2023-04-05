import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BoardsComponent } from './boards.component';
import { AuthGuardService } from '../auth/services/auth-guard.service';
import { BoardsService } from '../shared/services/boards.service';
import { InlineFormModule } from "../shared/modules/inlineForm/inlineForm.module";
import { TopBarModule } from '../shared/modules/topBar/topBar.module';

const routes: Routes = [
    {
        path: 'boards',
        component: BoardsComponent,
        canActivate: [AuthGuardService],
    }
]

@NgModule({
    declarations: [BoardsComponent],
    exports: [],
    providers: [BoardsService],
    imports: [CommonModule, RouterModule.forChild(routes), InlineFormModule, TopBarModule]
})
export class BoardsModule {}