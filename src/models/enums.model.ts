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
    [ExpenseCategory.FOOD]:          { icon: '🍽️', color: '#FF7043', label: 'Food' },
    [ExpenseCategory.TRANSPORT]:     { icon: '🚗', color: '#42A5F5', label: 'Transport' },
    [ExpenseCategory.UTILITIES]:     { icon: '⚡', color: '#AB47BC', label: 'Bills' },
    [ExpenseCategory.ENTERTAINMENT]: { icon: '🎬', color: '#EF5350', label: 'Entertainment' },
    [ExpenseCategory.HEALTH]:        { icon: '💊', color: '#EC407A', label: 'Health' },
    [ExpenseCategory.SHOPPING]:      { icon: '🛍️', color: '#26C6DA', label: 'Shopping' },
    [ExpenseCategory.EDUCATION]:     { icon: '📚', color: '#5C6BC0', label: 'Education' },
    [ExpenseCategory.TRAVEL]:        { icon: '✈️', color: '#66BB6A', label: 'Travel' },
    [ExpenseCategory.RENT]:          { icon: '🏠', color: '#FFA726', label: 'House' },
    [ExpenseCategory.SALARY]:        { icon: '💼', color: '#4CAF50', label: 'Salary' },
    [ExpenseCategory.FREELANCE]:     { icon: '💻', color: '#26A69A', label: 'Freelance' },
    [ExpenseCategory.OTHER]:         { icon: '📦', color: '#90A4AE', label: 'Other' },
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
