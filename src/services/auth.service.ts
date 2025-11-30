// src/app/auth.service.ts
import { Injectable, inject } from '@angular/core';
import {
    Auth,
    GoogleAuthProvider,
    OAuthProvider,
    signOut,
    authState,
    User,
    signInWithPopup,
    signInWithCredential,
} from '@angular/fire/auth';
import { GooglePlus } from '@awesome-cordova-plugins/google-plus/ngx';
import { Platform } from '@ionic/angular/common';
import { signInWithRedirect, UserCredential } from 'firebase/auth';
import { Observable } from 'rxjs';
import { Capacitor } from '@capacitor/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private auth = inject(Auth);
    private platform = inject(Platform);
    private googlePlus = inject(GooglePlus);
    user$: Observable<User | null> = authState(this.auth);

    async signInWithGoogle() {
        if (Capacitor.isNativePlatform()) {
            return await this.signInWithGoogleCredentials();
        }
        else {
            return await this.signInWithGooglePopup();
        }
    }

    async signInWithGooglePopup() {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('openid');
        provider.addScope('profile');
        // Optional: provider.setCustomParameters({ prompt: 'select_account' });
        return signInWithPopup(this.auth, provider);
    }

    async signInWithGoogleCredentials() {
        const googleUser = await this.googlePlus.login({ webClientId: '00524656766-m8gmqts87oacksg71f1frn2rb810bk4s.apps.googleusercontent.com', offline: true });

        const credential = GoogleAuthProvider.credential(googleUser.idToken);
        return await signInWithCredential(this.auth, credential);
    }

    async signInWithMicrosoft() {
        if (Capacitor.isNativePlatform()) {
            return await this.signInWithMicrosoftCredential();
        }
        else {
            return await this.signInWithMicrosoftPopup();
        }
    }

    async signInWithMicrosoftPopup() {
        const provider = new OAuthProvider('microsoft.com');
        // Request profile/email; add Graph scopes if you later need them
        provider.setCustomParameters({ prompt: 'select_account' });
        provider.addScope('email');
        provider.addScope('openid');
        provider.addScope('profile');

        return signInWithPopup(this.auth, provider);
    }

    async signInWithMicrosoftCredential(): Promise<UserCredential> {
        return new Promise((resolve, reject) => {
            this.platform.ready().then(async () => {
                const msToken = await (window as any).MSAL.login();
                const credential = new OAuthProvider("microsoft.com").credential({
                    idToken: msToken
                });
                resolve(await signInWithCredential(this.auth, credential));
            });
        });
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
