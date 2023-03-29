import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { RegisterComponent } from './components/register/register.component';
import { RouterModule, Routes } from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms'

const routes: Routes = [
  {
    path: 'register',
    component: RegisterComponent,
  },
];

@NgModule({
  declarations: [
    RegisterComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    ReactiveFormsModule
  ],
  providers: [AuthService],
})
export class AuthModule { }
