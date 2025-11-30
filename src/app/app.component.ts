import { DatePipe, NgFor, NgClass, CurrencyPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { LoaderComponent } from "./loader/loader.component";
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule, RouterOutlet, LoaderComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  isLoading = false;

  constructor(
    private loaderService: LoaderService
  ) {
  }

  ngOnInit(): void {
    this.loaderService.loaderSubject.subscribe((loading: boolean) => {
      this.isLoading = loading;
    });
  }
  title = 'exma';
}

