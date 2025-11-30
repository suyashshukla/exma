import { EventEmitter, Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LoaderService {
    private _loading: boolean = false;
    loaderSubject = new EventEmitter<boolean>();

    show() {
        this._loading = true;
        this.loaderSubject.emit(this._loading);
    }

    hide() {
        this._loading = false;
        this.loaderSubject.emit(this._loading);
    }
}