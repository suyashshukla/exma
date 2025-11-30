import { Component, OnInit } from "@angular/core";
import { ContextService } from "../../services/context.service";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { AndroidPermissions } from "@awesome-cordova-plugins/android-permissions/ngx";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { TransactionType } from "../../models/enums.model";
import { Expense } from "../../models/expense.model";
import { ExpenseService } from "../../services/expense.service";
import { SMSService } from "../../services/sms.service";
import { UtilService } from "../../services/util.service";
import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from "@angular/common";
import { AppUser } from "../../models/user-context.model";
import { AuthService } from "../../services/auth.service";
import { LoaderService } from "../../services/loader.service";
import { Capacitor } from "@capacitor/core";

@Component({
    selector: "app-home",
    templateUrl: "./home.component.html",
    imports: [NgClass, CurrencyPipe, NgIf, NgFor, ReactiveFormsModule, DatePipe],
})
export class HomeComponent implements OnInit {
    title = 'exma';
    today: Date = new Date();
    expenses: Expense[] = [];
    addTransactionForm!: FormGroup;
    expenseType = TransactionType;
    hasPermission: boolean = false;
    currentUser: AppUser;
    modalRef!: BsModalRef;;

    constructor(
        private expenseService: ExpenseService,
        private modalService: BsModalService,
        private androidPermissions: AndroidPermissions,
        private smsService: SMSService,
        private router: Router,
        private contextService: ContextService,
        private authService: AuthService,
        private loaderService: LoaderService
    ) {
        this.currentUser = this.contextService.appUser;
    }

    ngOnInit(): void {
        if (!this.contextService.isAuthenticated) {
            this.router.navigate(['login']);
            return;
        }

        this.loadExpenses();
        this.checkForPermissions();
    }

    getDailyBalance(): number {
        let balance = 0;

        this.expenses.forEach(expense => {
            if (expense.type === TransactionType.CREDIT) {
                balance += expense.amount;
            } else if (expense.type === TransactionType.DEBIT) {
                balance -= expense.amount;
            }
        });

        return balance;
    }

    logout() {
        this.loaderService.show();
        this.authService.signOut().then(() => {
            this.contextService.isAuthenticated = false;
            this.contextService.appUser = null as any;
            this.router.navigate(['login']);
            this.loaderService.hide();
        });
    }

    checkForPermissions() {
        if (!Capacitor.isNativePlatform()) {
            return;
        }
        this.loaderService.show();
        this.androidPermissions
            .requestPermissions([this.androidPermissions.PERMISSION.SEND_SMS, this.androidPermissions.PERMISSION.RECEIVE_SMS, this.androidPermissions.PERMISSION.READ_SMS, this.androidPermissions.PERMISSION.READ_PHONE_STATE])
            .then(result => {
                this.smsService.startListeningToIncomingMessages((expense: Expense) => {
                    this.loadExpenses();
                });
                console.log('Permission granted', result);
                this.loaderService.hide();
            }, error => {
                console.log('Permission denied', error);
                this.loaderService.hide();
            });
    }

    syncMessagesFromDevice() {
        this.smsService.syncMessagesFromDevice();
    }

    initializeForm(transactionType: TransactionType, expense?: Expense) {
        this.addTransactionForm = new FormGroup({
            expenseId: new FormControl(expense?.expenseId),
            title: new FormControl(expense?.title, Validators.required),
            amount: new FormControl(expense?.amount, Validators.required),
            category: new FormControl(expense?.category, Validators.required),
            type: new FormControl(expense?.type ?? transactionType, Validators.required),
            source: new FormControl(expense?.source, Validators.required),
            timestamp: new FormControl(expense?.timestamp ?? new Date(), Validators.required)
        });
    }

    openAddTransactionModal(template: any, transactionType: TransactionType) {
        this.initializeForm(transactionType);
        this.modalRef = this.modalService.show(template, {
            ignoreBackdropClick: true,
            class: 'centered-modal'
        });
    }

    manageExpense(template: any, expense: Expense) {
        this.initializeForm(expense.type, expense);
        this.modalRef = this.modalService.show(template, {
            ignoreBackdropClick: true,
            class: 'centered-modal'
        });
    }

    closeModal() {
        this.modalRef.hide();
    }

    goToPreviousDay() {
        this.today = new Date(this.today.setDate(this.today.getDate() - 1));
        this.loadExpenses();
    }

    goToNextDay() {
        this.today = new Date(this.today.setDate(this.today.getDate() + 1));
        this.loadExpenses();
    }

    saveExpense() {
        this.loaderService.show();
        const expenseData = this.addTransactionForm.value;
        const newExpense = new Expense(expenseData);
        newExpense.expenseId = newExpense.expenseId ?? UtilService.generateUUID();

        this.expenseService.saveExpense(newExpense).then(() => {
            this.loadExpenses();
            this.modalService.hide();
            this.loaderService.hide();
        });
    }

    deleteExpense(expenseId: string) {
        this.loaderService.show();
        this.expenseService.removeExpense(expenseId).then(() => {
            this.loadExpenses();
            this.modalService.hide();
            this.loaderService.hide();
        });
    }

    private async loadExpenses() {
        this.loaderService.show();
        this.expenses = await this.expenseService.getExpensesForUser(this.today);
        this.loaderService.hide();
    }

    get isEditExpense(): boolean {
        return this.addTransactionForm && this.addTransactionForm.get('expenseId')?.value;
    }
}