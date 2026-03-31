import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CurrencyPipe, NgClass, NgFor, NgIf } from "@angular/common";
import { AccountService } from "../../services/account.service";
import { ExpenseService } from "../../services/expense.service";
import { ContextService } from "../../services/context.service";
import { LoaderService } from "../../services/loader.service";
import { UtilService } from "../../services/util.service";
import { Account } from "../../models/account.model";
import { Expense } from "../../models/expense.model";
import { AccountType, ACCOUNT_META, TransactionType, PeriodType } from "../../models/enums.model";

interface AccountVM {
    account: Account;
    icon: string;
    balance: number;
    income: number;
    expenses: number;
}

@Component({
    selector: "app-accounts",
    templateUrl: "./accounts.component.html",
    imports: [FormsModule, NgClass, NgFor, NgIf, CurrencyPipe],
})
export class AccountsComponent implements OnInit {

    accountVMs: AccountVM[] = [];
    allExpenses: Expense[] = [];

    // Add-account panel
    showAddPanel = false;
    newAccountName = '';
    newAccountType: AccountType = AccountType.CASH;

    readonly accountTypes = Object.values(AccountType);
    readonly ACCOUNT_META = ACCOUNT_META;

    constructor(
        private accountService: AccountService,
        private expenseService: ExpenseService,
        private contextService: ContextService,
        private loaderService: LoaderService,
        private router: Router,
    ) { }

    async ngOnInit(): Promise<void> {
        if (!this.contextService.isAuthenticated) {
            this.router.navigate(['/login']);
            return;
        }
        await this.loadData();
    }

    private async loadData(): Promise<void> {
        this.loaderService.show();
        const [accounts, expenses] = await Promise.all([
            this.accountService.getAccountsForUser(),
            this.expenseService.getExpensesForPeriod(PeriodType.ALL, new Date()),
        ]);
        this.allExpenses = expenses;
        this.accountVMs = accounts.map(acc => this.buildVM(acc, expenses));
        this.loaderService.hide();
    }

    private buildVM(account: Account, expenses: Expense[]): AccountVM {
        const accExpenses = expenses.filter(e => e.accountId === account.accountId);
        const income   = accExpenses.filter(e => e.type === TransactionType.CREDIT).reduce((s, e) => s + e.amount, 0);
        const spent    = accExpenses.filter(e => e.type === TransactionType.DEBIT).reduce((s, e) => s + e.amount, 0);
        return {
            account,
            icon: ACCOUNT_META[account.type]?.icon ?? '💼',
            balance: income - spent,
            income,
            expenses: spent,
        };
    }

    get totalBalance(): number {
        return this.accountVMs.reduce((s, vm) => s + vm.balance, 0);
    }

    openAddPanel(): void {
        this.showAddPanel = true;
        this.newAccountName = '';
        this.newAccountType = AccountType.CASH;
    }

    cancelAdd(): void {
        this.showAddPanel = false;
    }

    async addAccount(): Promise<void> {
        if (!this.newAccountName.trim()) return;
        this.loaderService.show();
        const account = new Account({
            accountId: UtilService.generateUUID(),
            name: this.newAccountName.trim(),
            type: this.newAccountType,
            color: ACCOUNT_META[this.newAccountType].color,
            isDefault: this.accountVMs.length === 0,
            createdAt: new Date(),
        });
        await this.accountService.saveAccount(account);
        this.showAddPanel = false;
        await this.loadData();
    }

    async deleteAccount(accountId: string): Promise<void> {
        this.loaderService.show();
        await this.accountService.deleteAccount(accountId);
        await this.loadData();
    }

    async setDefault(accountId: string): Promise<void> {
        this.loaderService.show();
        for (const vm of this.accountVMs) {
            vm.account.isDefault = vm.account.accountId === accountId;
            await this.accountService.saveAccount(vm.account);
        }
        await this.loadData();
    }

    goBack(): void {
        this.router.navigate(['/home']);
    }
}
