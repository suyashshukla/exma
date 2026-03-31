import { inject, Injectable } from "@angular/core";
import { collection, deleteDoc, doc, Firestore, getDocs, query, setDoc, where } from "@angular/fire/firestore";
import { Expense } from "../models/expense.model";
import { ContextService } from "./context.service";
import { UserExpenseMapping } from "../models/user-expense-mapping.model";
import { ExpenseCategory, ExpenseSource, PeriodType } from "../models/enums.model";

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {

    firestore = inject(Firestore);
    constructor(
        private contextService: ContextService
    ) { }

    async saveExpense(expense: Expense) {
        expense.userId = this.contextService.appUser?.userId || '';
        expense.deviceId = this.contextService.appUser?.deviceId || '';
        expense.source = expense.source || ExpenseSource.MANUAL;
        expense.category = expense.category || ExpenseCategory.OTHER;
        const collectionRef = collection(this.firestore, 'expenses');
        const docRef = doc(collectionRef, expense.expenseId);
        await setDoc(docRef, { ...expense });

        const expenseUserMapping = new UserExpenseMapping({
            expenseId: expense.expenseId,
            userId: this.contextService.appUser?.userId
        });
        const mappingCollectionRef = collection(this.firestore, 'user-expense-mappings');
        const docMappingRef = doc(mappingCollectionRef, expense.expenseId);
        await setDoc(docMappingRef, JSON.parse(JSON.stringify(expenseUserMapping)));
    }

    async removeExpense(expenseId: string) {
        await deleteDoc(doc(this.firestore, 'expenses', expenseId));
        await deleteDoc(doc(this.firestore, 'user-expense-mappings', expenseId));
    }

    async updateExpense(expense: Expense) {
        await this.saveExpense(expense);
    }

    async getExpensesForUser(date: Date): Promise<Expense[]> {
        return this.getExpensesForPeriod(PeriodType.DAY, date);
    }

    async getExpensesForPeriod(period: PeriodType, referenceDate: Date, accountId?: string): Promise<Expense[]> {
        const userId = this.contextService.appUser?.userId;
        if (!userId) return [];

        const { start, end } = this.getPeriodBounds(period, referenceDate);

        const expenseCollectionRef = collection(this.firestore, 'expenses');
        let q;

        if (accountId) {
            q = query(expenseCollectionRef,
                where('userId', '==', userId),
                where('accountId', '==', accountId),
                where('timestamp', '>=', start),
                where('timestamp', '<=', end)
            );
        } else {
            q = query(expenseCollectionRef,
                where('userId', '==', userId),
                where('timestamp', '>=', start),
                where('timestamp', '<=', end)
            );
        }

        const dataSnapshot = await getDocs(q);
        const expenses: Expense[] = [];
        dataSnapshot.forEach(docSnap => {
            const expenseData = docSnap.data() as any;
            expenseData.timestamp = expenseData.timestamp.toDate();
            expenses.push(expenseData);
        });

        return expenses.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    getPeriodBounds(period: PeriodType, date: Date): { start: Date; end: Date } {
        const start = new Date(date);
        const end = new Date(date);

        switch (period) {
            case PeriodType.DAY:
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case PeriodType.WEEK:
                const dayOfWeek = start.getDay();
                start.setDate(start.getDate() - dayOfWeek);
                start.setHours(0, 0, 0, 0);
                end.setDate(start.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                break;
            case PeriodType.MONTH:
                start.setDate(1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(end.getMonth() + 1, 0);
                end.setHours(23, 59, 59, 999);
                break;
            case PeriodType.YEAR:
                start.setMonth(0, 1);
                start.setHours(0, 0, 0, 0);
                end.setMonth(11, 31);
                end.setHours(23, 59, 59, 999);
                break;
            case PeriodType.ALL:
                start.setFullYear(2000, 0, 1);
                start.setHours(0, 0, 0, 0);
                end.setFullYear(2099, 11, 31);
                end.setHours(23, 59, 59, 999);
                break;
        }
        return { start, end };
    }
}
