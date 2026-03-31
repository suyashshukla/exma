import { AccountType } from "./enums.model";

export class Account {
    accountId!: string;
    name!: string;
    type!: AccountType;
    userId!: string;
    color!: string;
    isDefault!: boolean;
    createdAt!: Date;

    constructor(args: any) {
        this.accountId = args.accountId;
        this.name = args.name;
        this.type = args.type || AccountType.CASH;
        this.userId = args.userId || '';
        this.color = args.color || '#10b981';
        this.isDefault = args.isDefault || false;
        this.createdAt = args.createdAt instanceof Date
            ? args.createdAt
            : (args.createdAt?.toDate?.() ?? new Date());
    }
}
