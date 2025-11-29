import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { OAuthProvider, signOut, User } from "@firebase/auth";

import { ContextService } from "../../services/context.service";
import { CarouselModule } from "ngx-bootstrap/carousel";
import { LoginService } from "../../services/login.service";
import { AuthService } from "../../services/auth.service";
import { AppUser } from "../../models/user-context.model";

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
        private contextService: ContextService) {
    }

    ngOnInit(): void {
        if (this.contextService.isAuthenticated) {
            this.router.navigate(['home']);
        }
    }

    initializeAppUser(user: User) {

        this.loginService.initializeAppUser(user).then((currentUser) => {
            this.currentUser = currentUser;
            this.contextService.appUser = currentUser;
            this.contextService.isAuthenticated = true;
            this.router.navigate(['home']);
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