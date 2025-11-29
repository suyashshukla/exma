// src/app/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
    Auth,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithPopup,
    signOut,
    authState,
    User,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    user$: Observable<User | null> = authState(this.auth);

    async signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('openid');
        provider.addScope('profile');
        // Optional: provider.setCustomParameters({ prompt: 'select_account' });
        return signInWithPopup(this.auth, provider);
    }

    async signInWithMicrosoft() {
        const provider = new OAuthProvider('microsoft.com');
        // Request profile/email; add Graph scopes if you later need them
        provider.setCustomParameters({ prompt: 'select_account' });
        provider.addScope('email');
        provider.addScope('openid');
        provider.addScope('profile');

        return signInWithPopup(this.auth, provider);
    }

    async signOut() {
        return signOut(this.auth);
    }

    /** Get current Firebase ID token for calling your backend */
    async getIdToken(forceRefresh = false): Promise<string | null> {
        const u = this.auth.currentUser;
        return u ? u.getIdToken(forceRefresh) : Promise.resolve(null);
    }
}
