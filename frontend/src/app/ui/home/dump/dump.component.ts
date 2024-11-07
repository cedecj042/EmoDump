import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Dumps } from '../../../shared/interfaces/Dumps';
import { DumpService } from '../../../shared/services/dump.service';
// import data from '@emoji-mart/data';

@Component({
  selector: 'app-dump',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
  ],
  templateUrl: './dump.component.html',
  styleUrl: './dump.component.css'
})
export class DumpComponent implements OnInit {
  @Input() currentUser: any;
  dumpForm!: FormGroup;
  dump!: Dumps;
  event!: Event;
  constructor(private fb: FormBuilder, private dumpService: DumpService) { }

  ngOnInit(): void {
    this.dumpForm = this.fb.group({
      dump_content: ['', [Validators.required, Validators.maxLength(250)]]
    })
    
  }
  getDumpContent(): string {
    return this.dumpForm.get('dump_content')?.value;
  }

  createDump(): void {
    let dumpdata = {
      dump_content: this.getDumpContent(),
      user_id: this.currentUser.id
    }
    this.dumpForm.patchValue({dump_content:''})
    this.dumpService.createDump(dumpdata, this.currentUser.id);
  }
  
}
