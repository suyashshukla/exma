import { inject, Injectable } from "@angular/core";
import { addDoc, collection, deleteDoc, doc, Firestore, getDocs, query, setDoc, where } from "@angular/fire/firestore";
import { Expense } from "../models/expense.model";
import { ContextService } from "./context.service";
import { UserExpenseMapping } from "../models/user-expense-mapping.model";
import { ExpenseCategory, ExpenseSource } from "../models/enums.model";

@Injectable({
    providedIn: 'root'
})
export class ExpenseService {

    firestore = inject(Firestore);
    constructor(
        private contextService: ContextService
    ) { }

    async saveExpense(expense: Expense) {
        expense.userId = this.contextService.currentUser?.userId || '';
        expense.deviceId = this.contextService.currentUser?.deviceId || '';
        expense.source = expense.source || ExpenseSource.MANUAL;
        expense.category = expense.category || ExpenseCategory.OTHER;
        const collectionRef = collection(this.firestore, 'expenses');
        const docRef = doc(collectionRef, expense.expenseId);
        await setDoc(docRef, { ...expense });

        const expenseUserMapping = new UserExpenseMapping({
            expenseId: expense.expenseId,
            userId: this.contextService.currentUser?.userId
        });
        const mappingCollectionRef = collection(this.firestore, 'user-expense-mappings');
        const docMappingRef = doc(mappingCollectionRef, expense.expenseId);
        await setDoc(docMappingRef, JSON.parse(JSON.stringify(expenseUserMapping)));
    }

    removeExpense(expenseId: string) {
        deleteDoc(doc(this.firestore, 'expenses', expenseId));
        deleteDoc(doc(this.firestore, 'user-expense-mappings', expenseId));
    }

    async updateExpense(expense: Expense) {
        await this.saveExpense(expense);
    }

    async getExpensesForUser(): Promise<Expense[]> {
        const userId = this.contextService.currentUser?.userId;
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        if (!userId) {
            return [];
        }

        const expenseCollectionRef = collection(this.firestore, 'expenses');
        const querySnapshot = query(expenseCollectionRef,
            where('userId', '==', userId),
            where('timestamp', '>=', currentDate)
        );
        const dataSnapshot = await getDocs(querySnapshot);

        const expenses: Expense[] = [];
        dataSnapshot.forEach(docSnap => {
            const expenseData = docSnap.data() as any;
            expenseData.timestamp = expenseData.timestamp.toDate();
            expenses.push(expenseData);
        });

        return expenses;
    }
}