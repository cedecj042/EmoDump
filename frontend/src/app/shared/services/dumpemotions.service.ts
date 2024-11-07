import { BehaviorSubject, Observable, map, tap } from "rxjs";
import { Emotions } from "../interfaces/Emotions";
import { HttpClient } from "@angular/common/http";
import { ServerResponse } from "../interfaces/ServerResponse";
import { Injectable } from "@angular/core";
import { Dumps } from "../interfaces/Dumps";

@Injectable({
    providedIn: 'root'
})
export class DumpEmotionService {
    private dumpEmotionsUrl = 'http://localhost:8000/api/dumpemotions/'; 
    private dumpEmotionsSubject = new BehaviorSubject<Emotions[]>([]);
    public dumpEmotions$: Observable<Emotions[]> = this.dumpEmotionsSubject.asObservable();

    constructor(private http:HttpClient){}

    loadDumpEmotions(dump?:Dumps):Observable<any>{
        const url = `${this.dumpEmotionsUrl}?dump_id=${dump?.dump_id}`
        console.log(url);
        return this.http.get<ServerResponse>(url).pipe(
            map(response => response.results),
            tap(emotions => {
                this.dumpEmotionsSubject.next(emotions);
                // console.log(this.dumpEmotions$);
            })
        )
    }
}