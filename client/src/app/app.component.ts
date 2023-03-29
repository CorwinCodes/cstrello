import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'client';
  constructor(private authService: AuthService) {}
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: (res) => {
        console.log('res', res);
      },
      error: (err) => {
        console.log('err', err)
        this.authService.setCurrentUser(null);
      }
    });
  }
}
