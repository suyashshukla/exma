import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { RedirectionComponent } from './login/redirection/redirection.component';
import { TransactionEntryComponent } from './transaction-entry/transaction-entry.component';
import { AccountsComponent } from './accounts/accounts.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'redirection',
        component: RedirectionComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'entry',
        component: TransactionEntryComponent
    },
    {
        path: 'accounts',
        component: AccountsComponent
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
