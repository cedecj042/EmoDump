import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { LoaderComponent } from '../../loader/loader.component';
import { DumpService } from '../../../shared/services/dump.service';
import { Dumps } from '../../../shared/interfaces/Dumps';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { take } from 'rxjs';

@Component({
  selector: 'app-feeds',
  standalone: true,
  providers: [DatePipe],
  imports: [
    CommonModule,
    LoaderComponent,
    MatIcon
  ],
  templateUrl: './feeds.component.html',
  styleUrl: './feeds.component.css',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0
      })),
      transition('void <=> *', animate(1000)),
    ])
  ]
})
export class FeedsComponent implements OnInit, OnChanges {
  @Input() currentUser: any;
  constructor(private dumpService: DumpService) { }
  dumps: Array<Dumps> = []
  isLoaded: boolean = false;
  activeDumpId: Number | null | undefined = null;
  isLoadingMore: boolean = false;
  currentPage: number = 1;


  ngOnInit(): void {
    this.dumpService.newDump$.subscribe(() => {
      this.showLoader();
      this.reloadDumps();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentUser'] && changes['currentUser'].currentValue) {
      this.reloadDumps();
      this.dumpService.loadDumps(this.currentPage, this.currentUser.id).subscribe(dumps => {
        this.dumps = dumps;
      });
    }
  }
  reloadDumps(): void {
    this.isLoaded = false;
    this.dumpService.dumps$.subscribe(dumps => {
      this.dumps = dumps;
      this.isLoaded = true;
    });
  }

  showLoader(): void {
    this.isLoaded = false;
  }
  loadMoreDumps(): void {
    if (!this.isLoadingMore) {
      this.isLoadingMore = true;
      this.currentPage++;
      this.dumpService.loadDumps(this.currentPage, this.currentUser.id).subscribe(dumps => {
        this.dumps.push(...dumps);
        this.isLoadingMore = false;
      });
    }
  }
  deleteDump(dumpid?: Number) {
    this.dumpService.deleteDump(dumpid).subscribe(() => {
      if (this.activeDumpId === dumpid) {
        this.activeDumpId = null;
      }
    }
    );
  }

  sendDataToCanvas(dump?: Dumps) {
    this.dumpService.currentDump.pipe(take(1)).subscribe(currentDump => {
      // Check if the clicked dump is the same as the current active dump
      if (currentDump && dump && currentDump.dump_id === dump.dump_id) {
        this.activeDumpId = null; // Set active dump ID to null
        this.dumpService.changeDumpId(undefined);
      } else {
        this.dumpService.changeDumpId(dump); // Change the active dump
        this.activeDumpId = dump?.dump_id; // Set the active dump ID
      }
    });
  }
}
