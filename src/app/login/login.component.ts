import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { getRedirectResult, OAuthProvider, signOut, User } from "@firebase/auth";

import { ContextService } from "../../services/context.service";
import { CarouselModule } from "ngx-bootstrap/carousel";
import { LoginService } from "../../services/login.service";
import { AuthService } from "../../services/auth.service";
import { AppUser } from "../../models/user-context.model";
import { LoaderService } from "../../services/loader.service";
import { Auth } from "@angular/fire/auth";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    standalone: true,
    imports: [CarouselModule],
})
export class LoginComponent implements OnInit {
    isLoginPageInitialized = false;

    currentUser!: AppUser;
    title = 'lafier';

    constructor(
        private router: Router,
        private loginService: LoginService,
        private authService: AuthService,
        private auth: Auth,
        private loaderService: LoaderService,
        private contextService: ContextService) {
    }

    async ngOnInit(): Promise<void> {
        if (this.contextService.isAuthenticated) {
            this.router.navigate(['home']);
        }
        else {
            const result = await getRedirectResult(this.auth);

            if (result?.user) {
                this.loginService.initializeAppUser(result.user).then((currentUser) => {
                    // Handle successful login, e.g., navigate to home or set user context
                });
            } else {
                this.router.navigate(['login']);
                // your login flow
            }
        }
    }

    initializeAppUser(user: User) {
        this.loaderService.show();
        this.loginService.initializeAppUser(user).then((currentUser) => {
            this.currentUser = currentUser;
            this.contextService.appUser = currentUser;
            this.contextService.isAuthenticated = true;
            this.router.navigate(['home']);
            this.loaderService.hide();
        });
    }

    signInWithMicrosoft() {
        this.authService.signInWithMicrosoft().then((result) => {
            this.authService.getIdToken().then((token: string | null) => {
                this.initializeAppUser(result.user);
            });
        });
    }

    signInWithGoogle() {
        this.authService.signInWithGoogle().then((result) => {
            this.authService.getIdToken().then((token: string | null) => {
                this.initializeAppUser(result.user);
            });
        });
    }

    signOut(): void {
        this.authService.signOut();
    }

    get windowInstance() {
        return window as any;
    }
}