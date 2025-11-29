import { inject, Injectable } from "@angular/core";
import { AppUser } from "../models/user-context.model";
import { of } from "rxjs";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { User } from "firebase/auth";
import { Firestore } from "@angular/fire/firestore";

@Injectable({
    providedIn: 'root'
})
export class LoginService {

    private firestore = inject(Firestore);

    // Placeholder for actual implementation
    async initializeAppUser(user: User) {
        const appUser = new AppUser({
            userId: user.uid,
            displayName: user.displayName || '',
            email: user.email || user.providerData[0]?.email || '',
            deviceId: user.uid
        });
        const usersCollection = collection(this.firestore, 'users');
        const userDocument = doc(usersCollection, user.uid);
        await setDoc(userDocument, JSON.parse(JSON.stringify(appUser)));
        return appUser;
    }

    async getCurrentUser(user: User) {
        const usersCollection = collection(this.firestore, 'users');
        const userDocument = doc(usersCollection, user.uid);

        const dataSnapshot = await getDoc(userDocument);

        if (dataSnapshot.exists()) {
            return dataSnapshot.data() as AppUser;
        } else {
            return this.initializeAppUser(user);
        }
    }
}