import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DumpService } from '../../../shared/services/dump.service';
import { EmotionService } from '../../../shared/services/emotion.service';
import { Emotions } from '../../../shared/interfaces/Emotions';
import { Dumps } from '../../../shared/interfaces/Dumps';
import { DumpEmotions } from '../../../shared/interfaces/DumpEmotions';
import { DumpEmotionService } from '../../../shared/services/dumpemotions.service';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-emotions',
  standalone: true,
  imports: [
    RouterOutlet,
    DatePipe,
    NgClass],
  templateUrl: './emotions.component.html',
  styleUrl: './emotions.component.css'
})
export class EmotionsComponent implements AfterViewInit,OnInit {
  constructor(
    private dumpService:DumpService,
    private emotionService:EmotionService,
    private dumpEmotionsService:DumpEmotionService,
    private cdr: ChangeDetectorRef
  ) { }
  dump?: Dumps;
  dumpEmotions?:Array<DumpEmotions>;
  emotions:Array<Emotions>=[];
  mappedEmotions: Array<{ emotion_name: String, probability: Number }> = [];
  topEmotions: Array<{ emotion_name: String, probability: Number}> = [];
  ngAfterViewInit(): void {  }
  
  ngOnInit(): void {
    this.dumpService.currentDump.subscribe(dump => {
      this.dump = dump;
      if (this.dump) {
        this.dumpEmotionsService.loadDumpEmotions(this.dump).subscribe(probabilities => {
          this.dumpEmotions = probabilities;
          this.tryMapEmotionsAndTopEmotions();
        });
      }
    });

    this.emotionService.loadEmotions().subscribe(emotions => {
      this.emotions = emotions;
      this.tryMapEmotionsAndTopEmotions();
    });
  }

  private tryMapEmotionsAndTopEmotions(): void {
    if (this.dumpEmotions && this.emotions.length > 0) {
      this.mapEmotions();
      this.getTopEmotions();
      this.cdr.detectChanges(); // Ensure change detection runs
    }
  }
  private mapEmotions(): void {
    if (this.dumpEmotions && this.emotions.length > 0) {
      this.mappedEmotions = this.dumpEmotions.map(dumpEmotion => {
        const emotion = this.emotions.find(e => e.emotion_id === dumpEmotion.emotion_id);

        return {
          emotion_name: emotion ? emotion.emotion_name : 'Unknown',
          probability: parseFloat(dumpEmotion.probability.toFixed(2))
        };
      });
    }
  }
  private getTopEmotions(): void {
    const sortedMappedEmotions = [...this.mappedEmotions].sort((a, b) => {
      const aProbability = typeof a.probability === 'number' ? a.probability : 0; // Fallback to 0 if not a number
      const bProbability = typeof b.probability === 'number' ? b.probability : 0; // Fallback to 0 if not a number
      return bProbability - aProbability;
    });
    this.topEmotions = sortedMappedEmotions.slice(0, 3);
  }
}

