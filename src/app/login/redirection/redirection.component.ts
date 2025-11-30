import { Component, inject } from "@angular/core";
import { Auth, getRedirectResult, User } from "@angular/fire/auth";
import { LoginService } from "../../../services/login.service";
import { Router } from "@angular/router";
import { ContextService } from "../../../services/context.service";
import { LoaderService } from "../../../services/loader.service";

@Component({
    selector: "app-redirection",
    template: `<p>Redirecting...</p>`,
})
export class RedirectionComponent {

    private auth = inject(Auth);

    constructor(
        private loginService: LoginService,
        private loaderService: LoaderService,
        private contextService: ContextService,
        private router: Router
    ) { }

    async ngOnInit() {
        const result = await getRedirectResult(this.auth);

        if (result?.user) {
            this.loginService.initializeAppUser(result.user).then((currentUser) => {
                // Handle successful login, e.g., navigate to home or set user context
            });
        } else {
            this.router.navigate(['login']);
            // your login flow
        }
        // Handle post-redirect sign-in logic here if needed
        // For example, you might want to check the authentication state
        // and navigate to the appropriate page.
    }

    initializeAppUser(user: User) {
        this.loaderService.show();
        this.loginService.initializeAppUser(user).then((currentUser) => {
            this.contextService.appUser = currentUser;
            this.contextService.isAuthenticated = true;
            this.router.navigate(['home']);
            this.loaderService.hide();
        });
    }

}