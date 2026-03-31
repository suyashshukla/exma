import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { NgClass, NgFor, NgIf } from "@angular/common";
import { ExpenseService } from "../../services/expense.service";
import { AccountService } from "../../services/account.service";
import { ContextService } from "../../services/context.service";
import { LoaderService } from "../../services/loader.service";
import { UtilService } from "../../services/util.service";
import { Expense } from "../../models/expense.model";
import { Account } from "../../models/account.model";
import {
    TransactionType,
    ExpenseCategory,
    CATEGORY_META,
    ACCOUNT_META,
    AccountType,
    ExpenseSource,
    PeriodType,
} from "../../models/enums.model";

interface CategoryOption {
    key: ExpenseCategory;
    icon: string;
    color: string;
    label: string;
}

@Component({
    selector: "app-transaction-entry",
    templateUrl: "./transaction-entry.component.html",
    imports: [FormsModule, NgClass, NgFor, NgIf],
})
export class TransactionEntryComponent implements OnInit {

    // expose enum to template
    readonly TT = TransactionType;

    // form state
    displayAmount = '0';
    note = '';
    selectedCategory: ExpenseCategory | null = null;
    selectedAccountId = '';
    selectedDate: string = new Date().toISOString().split('T')[0];
    transactionType: TransactionType = TransactionType.DEBIT;

    // edit mode
    editingExpenseId: string | null = null;
    isEdit = false;

    accounts: Account[] = [];

    readonly allExpenseCategories: CategoryOption[] = [
        ExpenseCategory.FOOD,
        ExpenseCategory.TRANSPORT,
        ExpenseCategory.UTILITIES,
        ExpenseCategory.ENTERTAINMENT,
        ExpenseCategory.HEALTH,
        ExpenseCategory.SHOPPING,
        ExpenseCategory.EDUCATION,
        ExpenseCategory.TRAVEL,
        ExpenseCategory.RENT,
        ExpenseCategory.OTHER,
    ].map(k => ({ key: k, ...CATEGORY_META[k] }));

    readonly allIncomeCategories: CategoryOption[] = [
        ExpenseCategory.SALARY,
        ExpenseCategory.FREELANCE,
        ExpenseCategory.OTHER,
    ].map(k => ({ key: k, ...CATEGORY_META[k] }));

    readonly numpadKeys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', '⌫'];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private expenseService: ExpenseService,
        private accountService: AccountService,
        private contextService: ContextService,
        private loaderService: LoaderService,
    ) { }

    async ngOnInit(): Promise<void> {
        if (!this.contextService.isAuthenticated) {
            this.router.navigate(['/login']);
            return;
        }

        this.loaderService.show();

        // Load accounts
        this.accounts = await this.accountService.getAccountsForUser();

        // Create a default "Cash" account on first use
        if (this.accounts.length === 0) {
            const def = this.accountService.createDefaultAccount();
            await this.accountService.saveAccount(def);
            this.accounts = [def];
        }

        const defaultAcc = this.accounts.find(a => a.isDefault) ?? this.accounts[0];
        this.selectedAccountId = defaultAcc?.accountId ?? '';

        // Check for query params
        const type = this.route.snapshot.queryParamMap.get('type') as TransactionType | null;
        const id   = this.route.snapshot.queryParamMap.get('id');

        if (id) {
            // Edit mode: load expense
            await this.loadExpenseForEdit(id);
        } else {
            this.transactionType = type === TransactionType.CREDIT ? TransactionType.CREDIT : TransactionType.DEBIT;
        }

        this.loaderService.hide();
    }

    private async loadExpenseForEdit(expenseId: string): Promise<void> {
        // We don't have a single-get method, so fetch by period ALL and find by id
        const all = await this.expenseService.getExpensesForPeriod(PeriodType.ALL, new Date());
        const expense = all.find(e => e.expenseId === expenseId);
        if (!expense) return;

        this.isEdit = true;
        this.editingExpenseId = expenseId;
        this.transactionType = expense.type;
        this.displayAmount = expense.amount.toString();
        this.note = expense.title;
        this.selectedCategory = expense.category;
        this.selectedAccountId = expense.accountId || this.selectedAccountId;
        this.selectedDate = new Date(expense.timestamp).toISOString().split('T')[0];
    }

    // ── Category ────────────────────────────────────────────────────────────────

    get visibleCategories(): CategoryOption[] {
        return this.transactionType === TransactionType.CREDIT
            ? this.allIncomeCategories
            : this.allExpenseCategories;
    }

    selectCategory(cat: ExpenseCategory): void {
        this.selectedCategory = cat;
    }

    // ── Numpad ──────────────────────────────────────────────────────────────────

    pressKey(key: string): void {
        if (key === '⌫') {
            this.displayAmount = this.displayAmount.length > 1
                ? this.displayAmount.slice(0, -1)
                : '0';
            return;
        }
        if (key === '.' && this.displayAmount.includes('.')) return;
        if (this.displayAmount === '0' && key !== '.') {
            this.displayAmount = key;
        } else {
            // max 2 decimal places
            const parts = this.displayAmount.split('.');
            if (parts[1] !== undefined && parts[1].length >= 2) return;
            this.displayAmount += key;
        }
    }

    get parsedAmount(): number {
        return parseFloat(this.displayAmount) || 0;
    }

    // ── Account icon ─────────────────────────────────────────────────────────────

    getAccountIcon(accountId: string): string {
        const acc = this.accounts.find(a => a.accountId === accountId);
        if (!acc) return '💼';
        return ACCOUNT_META[acc.type as AccountType]?.icon ?? '💼';
    }

    // ── Save / Delete ───────────────────────────────────────────────────────────

    async saveTransaction(overrideType?: TransactionType): Promise<void> {
        if (overrideType) this.transactionType = overrideType;

        if (this.parsedAmount <= 0) return;
        if (!this.selectedCategory) {
            // Auto-select first visible category
            this.selectedCategory = this.visibleCategories[0]?.key ?? ExpenseCategory.OTHER;
        }

        this.loaderService.show();

        const expense = new Expense({
            expenseId: this.editingExpenseId ?? UtilService.generateUUID(),
            type: this.transactionType,
            category: this.selectedCategory,
            amount: this.parsedAmount,
            timestamp: new Date(this.selectedDate),
            source: ExpenseSource.MANUAL,
            title: this.note.trim() || CATEGORY_META[this.selectedCategory].label,
            accountId: this.selectedAccountId,
        });

        await this.expenseService.saveExpense(expense);
        this.loaderService.hide();
        this.router.navigate(['/home']);
    }

    async deleteTransaction(): Promise<void> {
        if (!this.editingExpenseId) return;
        this.loaderService.show();
        await this.expenseService.removeExpense(this.editingExpenseId);
        this.loaderService.hide();
        this.router.navigate(['/home']);
    }

    goBack(): void {
        this.router.navigate(['/home']);
    }

    // ── Viewport zoom for note input ─────────────────────────────────────────────

    zoomToInput(event: FocusEvent): void {
        const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
        if (viewport) viewport.content = 'width=device-width, initial-scale=1.5, maximum-scale=4';
        setTimeout(() => (event.target as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }

    resetZoom(): void {
        const viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
        if (viewport) viewport.content = 'width=device-width, initial-scale=1';
    }
}
