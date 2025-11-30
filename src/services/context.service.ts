import { inject, Injectable } from "@angular/core";
import { AppUser } from "../models/user-context.model";
import { addDoc, collection, doc, Firestore, getDoc, setDoc } from "@angular/fire/firestore";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { LoginService } from "./login.service";
import { Auth, getRedirectResult } from "@angular/fire/auth";

@Injectable({
    providedIn: 'root'
})
export class ContextService {
    public appUser!: AppUser;
    public isAuthenticated = false;
    private auth = inject(Auth);

    constructor(
        private router: Router,
        private loginService: LoginService
    ) {
    }

    initialize() {
        const isRedirectResult = window.location.href.includes('redirect');
        if (isRedirectResult) {
            return Promise.resolve(true);
        }

        return this.waitForUser().then(user => {
            if (user) {
                return this.fetchUserData(user);
            }
            else {
                const result = getRedirectResult(this.auth).then((result) => {
                    if (result?.user) {
                        return this.fetchUserData(result.user);
                    } else {
                        this.router.navigate(['login']);
                        return Promise.resolve(false);
                    }
                });
                return result;
            }
        });
    }

    fetchUserData(user: User): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.loginService.getCurrentUser(user).then(user => {
                this.isAuthenticated = !!user;
                if (user) {
                    this.appUser = user;
                }
                resolve(true);
            }).catch(error => {
                this.router.navigate(['login']);
                resolve(false);
            });
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