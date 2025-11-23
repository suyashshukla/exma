import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';
import { ContextService } from '../services/context.service';
import { ModalModule } from 'ngx-bootstrap/modal';

import { SMS } from '@awesome-cordova-plugins/sms/ngx';
import { SmsRetrieverApi } from '@awesome-cordova-plugins/sms-retriever-api/ngx';
import { AndroidPermissions, } from '@awesome-cordova-plugins/android-permissions/ngx';
import { provideIonicAngular } from '@ionic/angular/standalone';

export const appConfig: ApplicationConfig = {
  providers: [
    AndroidPermissions,
    SMS,
    SmsRetrieverApi,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(
      ModalModule.forRoot(),
    ),
    provideAppInitializer(() => {
      return inject(ContextService).initializeApplication();
      // Any global initialization can go here
    }),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => getFirestore()), provideIonicAngular({})]
};

export const firebaseConfig = {
  apiKey: "AIzaSyCzcLAtf-Zhosb0uBx1p2h_WggeSsH4Loc",
  authDomain: "exma-3f3e9.firebaseapp.com",
  projectId: "exma-3f3e9",
  storageBucket: "exma-3f3e9.firebasestorage.app",
  messagingSenderId: "700101148488",
  appId: "1:700101148488:web:6231ec5a253825dcdc7d7d",
  measurementId: "G-HYLTEP0F33"
};
