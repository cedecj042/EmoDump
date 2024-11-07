import { Injectable } from "@angular/core";
import { HttpClient,HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "../interfaces/User";
import { Dumps } from "../interfaces/Dumps";

@Injectable({
    providedIn:'root'
})

export class AppDBService{

    baseURL: string = 'http://localhost:8000/api'
    
    constructor(private http:HttpClient){}

    getDumps(user:User):Observable<any>{
        return this.http.get(this.baseURL+`/dumps/?user_id=${user.id}&ordering=-dumptimestamp`);
    }
    createDumps(dump:Dumps):Observable<any>{
        return this.http.post(this.baseURL+"/dumps/",dump);
    }
}