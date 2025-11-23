import { Injectable } from "@angular/core";
import { ExpenseService } from "./expense.service";
import { Expense } from "../models/expense.model";
import { SMSEntity } from "../models/sms.model";
import { generateUUID } from "./context.service";
import { ExpenseCategory, ExpenseSource, TransactionType } from "../models/enums.model";
import { Platform } from "@ionic/angular/standalone";
declare var SMSReceive: any;  // ← ADD THIS HERE

@Injectable({
    providedIn: 'root'
})
export class SMSService {

    constructor(
        private expenseService: ExpenseService,
        private platform: Platform
    ) {
    }

    creditKeywords = ['credited', 'credit', 'received', 'deposited'];
    debitKeywords = ['debited', 'debit', 'withdrawn', 'purchased', 'spent', 'paid'];

    syncMessagesFromDevice() {

    }

    startListeningToIncomingMessages(expenseAddedCallback?: (expense: Expense) => void) {
        console.log(expenseAddedCallback);
        this.platform.ready().then(() => {
            if (this.platform.is('android')) {
                this.initializeSMSListener(expenseAddedCallback);
            }
        });
    }

    initializeSMSListener(expenseAddedCallback?: (expense: Expense) => void) {
        (window as any).cordova.plugins.SMSReceive.startWatch(() => {
            document.addEventListener('onSMSArrive', (e: any) => {
                const sms = e;
                console.log('SMS received', e);
                console.log('FROM:', sms.address);
                console.log('BODY:', sms.body);
                this.onSmsReceived(sms, expenseAddedCallback);
            });
        }, (err: any) => {
            console.log('watch start failed', err)
        });
    }

    onSmsReceived(sms: SMSEntity, expenseAddedCallback?: (expense: Expense) => void) {
        console.log('SMS received', sms);
        const transactionType = this.getTransactionTypeFromText(sms.body);
        if (!transactionType) {
            return;
        }

        const amount = this.extractAmountFromText(sms.body);
        if (!amount) {
            return;
        }

        const expense = this.convertSmsToExpense(sms);
        this.expenseService.saveExpense(expense).then(() => {
            console.log('Expense saved from SMS', expense);
            if (expenseAddedCallback) {
                expenseAddedCallback(expense);
            }
            else {
                console.log('No expense added callback provided');
            }
        }).catch((err) => {
            console.error('Error saving expense from SMS', err);
        });

    }

    convertSmsToExpense(sms: SMSEntity): Expense {
        const transactionType = this.getTransactionTypeFromText(sms.body);

        if (!transactionType) {
            throw new Error('Unable to determine transaction type from SMS');
        }

        return new Expense({
            expenseId: generateUUID(),
            title: sms.address,
            amount: this.extractAmountFromText(sms.body) || 0,
            timestamp: sms.date ? new Date(sms.date) : new Date(),
            type: transactionType,
            source: ExpenseSource.SMS_SYNC,
            category: ExpenseCategory.OTHER,
        });
    }

    getTransactionTypeFromText(text: string): TransactionType | null {
        const lowerText = text.toLowerCase();
        for (const keyword of this.creditKeywords) {
            if (lowerText.includes(keyword)) {
                return TransactionType.CREDIT;
            }
        }
        for (const keyword of this.debitKeywords) {
            if (lowerText.includes(keyword)) {
                return TransactionType.DEBIT;
            }
        }

        return null;
    }

    extractAmountFromText(text: string): number | null {
        const amountRegex = /(?:INR|Rs\.?|₹)\s?([\d,]+\.?\d{0,2})/i;
        const match = text.match(amountRegex);
        if (match && match[1]) {
            const amountStr = match[1].replace(/,/g, '');
            return parseFloat(amountStr);
        }
        return null;
    }

}