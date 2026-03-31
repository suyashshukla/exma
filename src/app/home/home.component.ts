import { Component, OnInit } from "@angular/core";
import { ContextService } from "../../services/context.service";
import { Router } from "@angular/router";
import { AndroidPermissions } from "@awesome-cordova-plugins/android-permissions/ngx";
import { TransactionType, ExpenseCategory, CATEGORY_META, PeriodType } from "../../models/enums.model";
import { Expense } from "../../models/expense.model";
import { ExpenseService } from "../../services/expense.service";
import { SMSService } from "../../services/sms.service";
import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import { AppUser } from "../../models/user-context.model";
import { AuthService } from "../../services/auth.service";
import { LoginService } from "../../services/login.service";
import { LoaderService } from "../../services/loader.service";
import { Capacitor } from "@capacitor/core";

interface ChartSegment {
    category: ExpenseCategory;
    label: string;
    icon: string;
    color: string;
    amount: number;
    percentage: number;
    dasharray: string;
    dashoffset: string;
    iconX: number;
    iconY: number;
    showIcon: boolean;
}

interface PeriodOption {
    label: string;
    value: PeriodType;
}

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    imports: [NgClass, CurrencyPipe, NgIf, NgFor, DatePipe],
})
export class HomeComponent implements OnInit {
    currentUser: AppUser;
    expenses: Expense[] = [];
    selectedCategory: ExpenseCategory | null = null;
    currentPeriod: PeriodType = PeriodType.MONTH;
    referenceDate: Date = new Date();
    expenseType = TransactionType;
    periodType = PeriodType;

    readonly periods: PeriodOption[] = [
        { label: 'D', value: PeriodType.DAY },
        { label: 'W', value: PeriodType.WEEK },
        { label: 'M', value: PeriodType.MONTH },
        { label: 'Y', value: PeriodType.YEAR },
        { label: 'All', value: PeriodType.ALL },
    ];

    readonly CIRCUMFERENCE = 2 * Math.PI * 100;
    readonly RING_RADIUS = 100;   // SVG ring radius (matches stroke centre)

    constructor(
        private expenseService: ExpenseService,
        private router: Router,
        private contextService: ContextService,
        private authService: AuthService,
        private loginService: LoginService,
        private loaderService: LoaderService,
        private androidPermissions: AndroidPermissions,
        private smsService: SMSService,
    ) {
        this.currentUser = this.contextService.appUser;
        this.currentPeriod = this.currentUser.preferredPeriod ?? PeriodType.MONTH;
    }

    ngOnInit(): void {
        if (!this.contextService.isAuthenticated) {
            this.router.navigate(['login']);
            return;
        }
        this.loadExpenses();
        this.checkForPermissions();
    }

    // ── Period navigation ───────────────────────────────────────────────────────

    setPeriod(period: PeriodType): void {
        this.currentPeriod = period;
        this.contextService.appUser.preferredPeriod = period;
        this.loginService.updatePreferredPeriod(this.currentUser.userId, period);
        this.referenceDate = new Date();
        this.selectedCategory = null;
        this.loadExpenses();
    }

    goPrev(): void {
        this.shiftDate(-1);
    }

    goNext(): void {
        this.shiftDate(1);
    }

    private shiftDate(direction: 1 | -1): void {
        const d = new Date(this.referenceDate);
        switch (this.currentPeriod) {
            case PeriodType.DAY:   d.setDate(d.getDate() + direction); break;
            case PeriodType.WEEK:  d.setDate(d.getDate() + direction * 7); break;
            case PeriodType.MONTH: d.setMonth(d.getMonth() + direction); break;
            case PeriodType.YEAR:  d.setFullYear(d.getFullYear() + direction); break;
            case PeriodType.ALL:   return;
        }
        this.referenceDate = d;
        this.selectedCategory = null;
        this.loadExpenses();
    }

    getPeriodLabel(): string {
        const d = this.referenceDate;
        switch (this.currentPeriod) {
            case PeriodType.DAY:
                return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
            case PeriodType.WEEK: {
                const bounds = this.expenseService.getPeriodBounds(PeriodType.WEEK, d);
                const fmt = (dt: Date) => dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                return `${fmt(bounds.start)} – ${fmt(bounds.end)}`;
            }
            case PeriodType.MONTH:
                return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
            case PeriodType.YEAR:
                return d.getFullYear().toString();
            case PeriodType.ALL:
                return 'All Time';
        }
    }

    // ── Chart data ──────────────────────────────────────────────────────────────

    get totalExpenses(): number {
        return this.expenses
            .filter(e => e.type === TransactionType.DEBIT)
            .reduce((s, e) => s + e.amount, 0);
    }

    get totalIncome(): number {
        return this.expenses
            .filter(e => e.type === TransactionType.CREDIT)
            .reduce((s, e) => s + e.amount, 0);
    }

    get balance(): number {
        return this.totalIncome - this.totalExpenses;
    }

    get chartSegments(): ChartSegment[] {
        const total = this.totalExpenses;
        if (total === 0) return [];

        let accumulated = 0;
        const segments: ChartSegment[] = [];

        for (const cat of Object.values(ExpenseCategory)) {
            const meta = CATEGORY_META[cat];
            const amount = this.expenses
                .filter(e => e.type === TransactionType.DEBIT && e.category === cat)
                .reduce((s, e) => s + e.amount, 0);

            if (amount === 0) continue;

            const percentage = amount / total;
            const segmentLength = percentage * this.CIRCUMFERENCE;
            const dashoffset = -(accumulated * this.CIRCUMFERENCE);

            const midAngleRad = -Math.PI / 2 + (accumulated + percentage / 2) * 2 * Math.PI;
            const iconX = 150 + this.RING_RADIUS * Math.cos(midAngleRad);
            const iconY = 150 + this.RING_RADIUS * Math.sin(midAngleRad);

            segments.push({
                category: cat,
                label: meta.label,
                icon: meta.icon,
                color: meta.color,
                amount,
                percentage,
                dasharray: `${segmentLength} ${this.CIRCUMFERENCE}`,
                dashoffset: `${dashoffset}`,
                iconX,
                iconY,
                showIcon: percentage > 0.06,
            });

            accumulated += percentage;
        }

        return segments;
    }

    get categoryLegend(): ChartSegment[] {
        return this.chartSegments.sort((a, b) => b.amount - a.amount);
    }

    // ── Category filter / transaction list ──────────────────────────────────────

    selectCategory(category: ExpenseCategory): void {
        this.selectedCategory = this.selectedCategory === category ? null : category;
    }

    get filteredExpenses(): Expense[] {
        if (!this.selectedCategory) {
            return this.expenses;
        }
        return this.expenses.filter(e => e.category === this.selectedCategory);
    }

    getCategoryMeta(category: ExpenseCategory) {
        return CATEGORY_META[category] ?? { icon: '📦', color: '#94a3b8', label: 'Other' };
    }

    // ── Navigation ──────────────────────────────────────────────────────────────

    addTransaction(type: 'CREDIT' | 'DEBIT'): void {
        this.router.navigate(['/entry'], { queryParams: { type } });
    }

    editTransaction(expense: Expense): void {
        this.router.navigate(['/entry'], { queryParams: { id: expense.expenseId } });
    }

    goToAccounts(): void {
        this.router.navigate(['/accounts']);
    }

    logout(): void {
        this.loaderService.show();
        this.authService.signOut().then(() => {
            this.contextService.isAuthenticated = false;
            this.contextService.appUser = null as any;
            this.router.navigate(['login']);
            this.loaderService.hide();
        });
    }

    // ── Permissions / SMS ───────────────────────────────────────────────────────

    private checkForPermissions(): void {
        if (!Capacitor.isNativePlatform()) return;
        this.loaderService.show();
        this.androidPermissions
            .requestPermissions([
                this.androidPermissions.PERMISSION.SEND_SMS,
                this.androidPermissions.PERMISSION.RECEIVE_SMS,
                this.androidPermissions.PERMISSION.READ_SMS,
                this.androidPermissions.PERMISSION.READ_PHONE_STATE,
            ])
            .then(() => {
                this.smsService.startListeningToIncomingMessages(() => this.loadExpenses());
                this.loaderService.hide();
            }, () => this.loaderService.hide());
    }

    private async loadExpenses(): Promise<void> {
        this.loaderService.show();
        this.expenses = await this.expenseService.getExpensesForPeriod(this.currentPeriod, this.referenceDate);
        this.loaderService.hide();
    }
}
