import { inject, Injectable } from "@angular/core";
import { User } from "../models/user-context.model";
import { addDoc, collection, doc, Firestore, getDoc, setDoc } from "@angular/fire/firestore";

@Injectable({
    providedIn: 'root'
})
export class ContextService {
    private firestore = inject(Firestore);

    constructor() {
    }

    private user: User | null = null;

    get currentUser(): User | null {
        return this.user;
    }

    async initializeApplication() {
        const deviceId = window.localStorage.getItem('deviceId') || generateUUID();
        if (!window.localStorage.getItem('deviceId')) {
            window.localStorage.setItem('deviceId', deviceId);
        }

        const usersCollection = collection(this.firestore, 'users');
        const userDocument = doc(usersCollection, deviceId);

        const dataSnapshot = await getDoc(userDocument);
        
        if (dataSnapshot.exists()) {
            this.user = dataSnapshot.data() as User;
        } else {
            this.user = new User({
                userId: generateUUID(),
                deviceId: deviceId
            });
            await setDoc(userDocument, JSON.parse(JSON.stringify(this.user)));
        }
    }

    
}

export function generateUUID(): string {
        // Public Domain/MIT
        var d = new Date().getTime();//Timestamp
        var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16;//random number between 0 and 16
            if (d > 0) {
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }