import { Component, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { User } from '../../shared/interfaces/User';
import { NgClass, NgStyle } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { LoaderComponent } from '../loader/loader.component';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [
    NgClass,
    NgStyle,
    LoaderComponent,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate(1000)),
    ])
  ]
})
export class NavComponent implements OnChanges {
  @Input() currentUser: any;
  loaded: boolean = false;

  constructor(private router:Router){}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentUser'] && changes['currentUser'].currentValue) {
      setInterval(()=>{
        this.loaded = true;
      },1000)
    }
  }
}
