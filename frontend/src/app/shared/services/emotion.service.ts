import { BehaviorSubject, Observable, map, tap } from "rxjs";
import { Emotions } from "../interfaces/Emotions";
import { HttpClient } from "@angular/common/http";
import { ServerResponse } from "../interfaces/ServerResponse";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class EmotionService {
    private emotionsUrl = 'http://127.0.0.1:8000/api/emotions/'; 
    private emotionsSubject = new BehaviorSubject<Emotions[]>([]);
    public emotions$: Observable<Emotions[]> = this.emotionsSubject.asObservable();

    constructor(private http:HttpClient){}

    loadEmotions():Observable<any>{
        return this.http.get<ServerResponse>(this.emotionsUrl).pipe(
            map(response => response.results),
            tap(emotions => {
                this.emotionsSubject.next(emotions);
                // console.log(this.emotions$);
            })
        )
    }
}