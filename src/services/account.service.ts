import { inject, Injectable } from "@angular/core";
import { collection, deleteDoc, doc, Firestore, getDocs, query, setDoc, where } from "@angular/fire/firestore";
import { Account } from "../models/account.model";
import { AccountType, ACCOUNT_META } from "../models/enums.model";
import { ContextService } from "./context.service";
import { UtilService } from "./util.service";

@Injectable({ providedIn: 'root' })
export class AccountService {
    firestore = inject(Firestore);

    constructor(private contextService: ContextService) { }

    async getAccountsForUser(): Promise<Account[]> {
        const userId = this.contextService.appUser?.userId;
        if (!userId) return [];
        const q = query(collection(this.firestore, 'accounts'), where('userId', '==', userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => new Account(d.data()));
    }

    async saveAccount(account: Account): Promise<void> {
        account.userId = this.contextService.appUser?.userId || '';
        const ref = doc(collection(this.firestore, 'accounts'), account.accountId);
        await setDoc(ref, JSON.parse(JSON.stringify(account)));
    }

    async deleteAccount(accountId: string): Promise<void> {
        await deleteDoc(doc(this.firestore, 'accounts', accountId));
    }

    createDefaultAccount(): Account {
        return new Account({
            accountId: UtilService.generateUUID(),
            name: 'Cash',
            type: AccountType.CASH,
            color: ACCOUNT_META[AccountType.CASH].color,
            isDefault: true,
            createdAt: new Date()
        });
    }

    getAccountIcon(type: AccountType): string {
        return ACCOUNT_META[type]?.icon ?? '💼';
    }
}
