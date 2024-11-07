import { NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [
    NgStyle
  ],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.css'
})
export class LoaderComponent {
  @Input() Cwidth:any;
  @Input() Cheight:any;
  @Input() circle:boolean=false;

  constructor (){}
  getMyStyles() {
    const myStyles = {
      'width': this.Cwidth ? this.Cwidth : '',
      'height': this.Cheight ? this.Cheight : '',
      'border-radius': this.circle ? '50%' : ''
    };
    return myStyles;
  }
}
