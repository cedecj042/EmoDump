import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, map, tap } from 'rxjs';
import { Dumps } from '../interfaces/Dumps';
import { ServerResponse } from '../interfaces/ServerResponse';

@Injectable({
    providedIn: 'root'
})
export class DumpService {
    private dumpsUrl = 'http://127.0.0.1:8000/api/dumps/';  // URL to your dumps API
    private dumpsSubject = new BehaviorSubject<Dumps[]>([]);
    public dumps$: Observable<Dumps[]> = this.dumpsSubject.asObservable();

    // Subject to notify about new dumps
    private newDumpSubject = new Subject<void>();
    public newDump$ = this.newDumpSubject.asObservable();

    //Subject to notify about sent dumps
    private dumpSource = new BehaviorSubject<Dumps | undefined>(undefined);
    currentDump = this.dumpSource.asObservable();

    private isLoadingSubject = new BehaviorSubject<boolean>(false);
    public isLoading$ = this.isLoadingSubject.asObservable();

    private showLoader(): void {
        this.isLoadingSubject.next(true);
    }

    private hideLoader(): void {
        this.isLoadingSubject.next(false);
    }

    constructor(private http: HttpClient) { }

    changeDumpId(dump?: Dumps) {
        this.dumpSource.next(dump);
    }

    loadDumps(page: Number = 1, user_id?: Number): Observable<Dumps[]> {
        let url = `${this.dumpsUrl}?page=${page}&ordering=-dump_timestamp&user_id=${user_id}`;
        return this.http.get<ServerResponse>(url).pipe(
            map(response => response.results),
            tap(dumps => this.updateDumpsArray(dumps)) // Update the dumps array
        );
    }
    // createDump(dump: Partial<Dumps>, user_id: Number): void {
    //     const payload = { ...dump, user_id }; // Include user_id in the payload
    //     this.http.post<Dumps>(this.dumpsUrl, payload).subscribe(
    //         newDump => {
    //             const currentDumps = this.dumpsSubject.getValue();
    //             this.dumpsSubject.next([newDump, ...currentDumps]);
    //             // Notify that a new dump has been created
    //             this.newDumpSubject.next();
    //         },
    //         error => console.error('Error creating dump:', error)
    //     );
    // }
    createDump(dump: Partial<Dumps>, user_id: Number): void {
        const payload = { ...dump, user_id }; // Include user_id in the payload
        this.showLoader(); // Show loader
        this.http.post<Dumps>(this.dumpsUrl, payload).subscribe(
            newDump => {
                const currentDumps = this.dumpsSubject.getValue();
                this.dumpsSubject.next([newDump, ...currentDumps]);
                // Notify that a new dump has been created
                this.newDumpSubject.next();
                this.hideLoader(); // Hide loader after success
            },
            error => {
                console.error('Error creating dump:', error);
                this.hideLoader(); // Hide loader on error
            }
        );
    }
    private updateDumpsArray(newDumps: Dumps[]): void {
        const currentDumps = this.dumpsSubject.getValue();
        const updatedDumps = [...currentDumps, ...newDumps]; // Concatenate new dumps with existing dumps
        this.dumpsSubject.next(updatedDumps);
    }
    deleteDump(dumpId?: Number): Observable<any> {
        const url = `${this.dumpsUrl}${dumpId}/`;
        return this.http.delete(url).pipe(
            map(response => console.log("Server response:", response)),
            tap(() => {
                // Update the dumps array locally
                const currentDumps = this.dumpsSubject.getValue();
                const updatedDumps = currentDumps.filter(dump => dump.dump_id !== dumpId);
                this.dumpsSubject.next(updatedDumps);
                // Check if the deleted dump is the current dump
                const currentDump = this.dumpSource.getValue();
                if (currentDump && currentDump.dump_id === dumpId) {
                    this.changeDumpId(undefined);
                }
            })
        );
    }

}


// loadDumps(user_id?: number): void {
//     let url = this.dumpsUrl;
//     if (user_id) {
//         url += `?user_id=${user_id}&ordering=-dump_timestamp`;
//     }
//     this.http.get<DumpsResponse>(url).subscribe(
//          // Utilizing the "results" field from the response
//         response => this.dumpsSubject.next(response.results),
//         error => console.error('Error loading dumps:', error)
//     );
// }
// loadDumps(user_id?: number): void {
//     let url = this.dumpsUrl;
//     if (user_id) {
//         url += `?user_id=${user_id}&ordering=-dump_timestamp`;
//     }
//     this.http.get<DumpsResponse>(url).pipe(
//         map(response => response.results.map(this.mapDump))
//     ).subscribe(
//         dumps => this.dumpsSubject.next(dumps),
//         error => console.error('Error loading dumps:', error)
//     );
// }