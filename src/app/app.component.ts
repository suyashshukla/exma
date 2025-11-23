import { DatePipe, NgFor, NgClass, CurrencyPipe, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { Expense } from '../models/expense.model';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { generateUUID } from '../services/context.service';
import { TransactionType } from '../models/enums.model';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { SMSService } from '../services/sms.service';

@Component({
  selector: 'app-root',
  imports: [DatePipe, NgFor, ReactiveFormsModule, NgClass, CurrencyPipe, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
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
    private smsService: SMSService
  ) { }

  ngOnInit(): void {
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
    newExpense.expenseId = generateUUID();
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
