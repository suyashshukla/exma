import { Component, OnInit } from "@angular/core";
import { ContextService } from "../../services/context.service";
import { Router } from "@angular/router";
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from "@angular/forms";
import { AndroidPermissions } from "@awesome-cordova-plugins/android-permissions/ngx";
import { BsModalService } from "ngx-bootstrap/modal";
import { TransactionType } from "../../models/enums.model";
import { Expense } from "../../models/expense.model";
import { ExpenseService } from "../../services/expense.service";
import { SMSService } from "../../services/sms.service";
import { UtilService } from "../../services/util.service";
import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from "@angular/common";

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

  constructor(
    private expenseService: ExpenseService,
    private modalService: BsModalService,
    private androidPermissions: AndroidPermissions,
    private smsService: SMSService,
    private router: Router,
    private contextService: ContextService
  ) { }

  ngOnInit(): void {
    if(!this.contextService.isAuthenticated) {
      this.router.navigate(['login']);
      return;
    }

    this.loadExpenses();
    this.checkForPermissions();
  }

  checkForPermissions() {
    this.androidPermissions
      .requestPermissions([this.androidPermissions.PERMISSION.SEND_SMS, this.androidPermissions.PERMISSION.RECEIVE_SMS, this.androidPermissions.PERMISSION.READ_SMS, this.androidPermissions.PERMISSION.READ_PHONE_STATE])
      .then(result => {
        this.smsService.startListeningToIncomingMessages((expense: Expense) => {
          this.loadExpenses();
        });
        console.log('Permission granted', result);
      }, error => {
        console.log('Permission denied', error);
      });
  }

  syncMessagesFromDevice() {
    this.smsService.syncMessagesFromDevice();
  }

  initializeForm(transactionType: TransactionType, expense?: Expense) {
    this.addTransactionForm = new FormGroup({
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
    this.modalService.show(template);
  }

  saveExpense() {
    const expenseData = this.addTransactionForm.value;
    const newExpense = new Expense({});
    newExpense.expenseId = UtilService.generateUUID();
    newExpense.title = expenseData.title;
    newExpense.amount = expenseData.amount;
    newExpense.category = expenseData.category;
    newExpense.type = expenseData.type;
    newExpense.source = expenseData.source;
    newExpense.timestamp = expenseData.timestamp;

    this.expenseService.saveExpense(newExpense).then(() => {
      this.loadExpenses();
      this.modalService.hide();
    });
  }

  private async loadExpenses() {
    this.expenses = await this.expenseService.getExpensesForUser();
  }
}