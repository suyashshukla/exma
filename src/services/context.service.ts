import { inject, Injectable } from "@angular/core";
import { AppUser } from "../models/user-context.model";
import { addDoc, collection, doc, Firestore, getDoc, setDoc } from "@angular/fire/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { LoginService } from "./login.service";

@Injectable({
    providedIn: 'root'
})
export class ContextService {
    private firestore = inject(Firestore);
    public appUser!: AppUser;
    public isAuthenticated = false;

    constructor(
        private router: Router,
        private loginService: LoginService
    ) {
    }

    private user: AppUser | null = null;

    get currentUser(): AppUser | null {
        return this.user;
    }

        initialize() {
        return this.waitForUser().then(user => {
            if (user) {
                return new Promise<boolean>((resolve, reject) => {
                    this.loginService.getCurrentUser(user).then(user => {
                        this.isAuthenticated = !!user;
                        if (user) {
                            this.appUser = user;
                        }
                        resolve(true);
                    }).catch(error => {
                        this.router.navigate(['login']);
                        resolve(error);
                    });
                });
            }
            else {
                this.isAuthenticated = false;
                this.router.navigate(['login']);
                return Promise.resolve(false);
            }
        });
    }

    waitForUser(): Promise<User | null> {
        const auth = getAuth();
        return new Promise(resolve => {
            const unsub = onAuthStateChanged(auth, user => {
                unsub(); // Unsubscribe immediately after first call
                resolve(user);
            });
        });
    }
}