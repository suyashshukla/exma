export class UserExpenseMapping{
    expenseId!: string;
    userId!: string;

    constructor(args:any){
        this.expenseId = args.expenseId;
        this.userId = args.userId;
    }
}