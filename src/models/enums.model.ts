export enum TransactionType {
    CREDIT = 'CREDIT',
    DEBIT = 'DEBIT'
}

export enum ExpenseCategory {
    FOOD = 'FOOD',
    TRANSPORT = 'TRANSPORT',
    UTILITIES = 'UTILITIES',
    ENTERTAINMENT = 'ENTERTAINMENT',
    HEALTH = 'HEALTH',
    SHOPPING = 'SHOPPING',
    EDUCATION = 'EDUCATION',
    TRAVEL = 'TRAVEL',
    RENT = 'RENT',
    SALARY = 'SALARY',
    FREELANCE = 'FREELANCE',
    OTHER = 'OTHER'
}

export const CATEGORY_META: Record<ExpenseCategory, { icon: string; color: string; label: string }> = {
    [ExpenseCategory.FOOD]:          { icon: '🍽️', color: '#C97B62', label: 'Food' },
    [ExpenseCategory.TRANSPORT]:     { icon: '🚗', color: '#6096BE', label: 'Transport' },
    [ExpenseCategory.UTILITIES]:     { icon: '⚡', color: '#8E6FAA', label: 'Bills' },
    [ExpenseCategory.ENTERTAINMENT]: { icon: '🎬', color: '#B06868', label: 'Entertainment' },
    [ExpenseCategory.HEALTH]:        { icon: '💊', color: '#AA6882', label: 'Health' },
    [ExpenseCategory.SHOPPING]:      { icon: '🛍️', color: '#5A9EAA', label: 'Shopping' },
    [ExpenseCategory.EDUCATION]:     { icon: '📚', color: '#6870A8', label: 'Education' },
    [ExpenseCategory.TRAVEL]:        { icon: '✈️', color: '#6AA870', label: 'Travel' },
    [ExpenseCategory.RENT]:          { icon: '🏠', color: '#C28A52', label: 'House' },
    [ExpenseCategory.SALARY]:        { icon: '💼', color: '#5A9862', label: 'Salary' },
    [ExpenseCategory.FREELANCE]:     { icon: '💻', color: '#4D9290', label: 'Freelance' },
    [ExpenseCategory.OTHER]:         { icon: '📦', color: '#8A9EAA', label: 'Other' },
};

export enum AccountType {
    CASH = 'CASH',
    BANK = 'BANK',
    CREDIT_CARD = 'CREDIT_CARD',
    SAVINGS = 'SAVINGS'
}

export const ACCOUNT_META: Record<AccountType, { icon: string; color: string; label: string }> = {
    [AccountType.CASH]:        { icon: '💵', color: '#66BB6A', label: 'Cash' },
    [AccountType.BANK]:        { icon: '🏦', color: '#42A5F5', label: 'Bank' },
    [AccountType.CREDIT_CARD]: { icon: '💳', color: '#FFA726', label: 'Credit Card' },
    [AccountType.SAVINGS]:     { icon: '🏧', color: '#AB47BC', label: 'Savings' },
};

export enum PeriodType {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR',
    ALL = 'ALL'
}

export enum ExpenseSource {
    MANUAL = 'MANUAL',
    SMS_SYNC = 'SMS_SYNC',
}
