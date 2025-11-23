import { ExpenseCategory, ExpenseSource, TransactionType } from "./enums.model";

export class Expense {
    expenseId!: string;
    type!: TransactionType;
    category!: ExpenseCategory;
    amount!: number;
    timestamp!: Date;
    source!: ExpenseSource;
    title!: string;

    // Can be removed if firestore allows relation data retrieval
    userId!: string;
    deviceId!: string;

    constructor(args: any) {
        this.expenseId = args.expenseId;
        this.type = args.type;
        this.category = args.category;
        this.amount = args.amount;
        this.timestamp = args.timestamp;
        this.source = args.source;
        this.title = args.title;
        this.userId = args.userId;
        this.deviceId = args.deviceId;
    }
}