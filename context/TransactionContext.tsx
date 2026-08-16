import { endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as db from '../database/db';
import { Transaction } from '../types';

interface TransactionContextType {
    transactions: Transaction[];
    loading: boolean;
    refreshTransactions: (filters?: { startDate?: string; endDate?: string; type?: string; source?: string }) => Promise<void>;
    addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
    deleteTransaction: (id: number) => Promise<void>;
    getDailyStats: (date: Date) => Promise<{ income: number; expense: number; balance: number }>;
    getMonthlyStats: (date: Date) => Promise<{ income: number; expense: number; balance: number }>;
    getHighestSpending: (date: Date) => Promise<{ source: string; total: number } | null>;
    getHighestExpenseDay: (date: Date) => Promise<{ date: string; total: number } | null>;
    getAllTimeStats: () => Promise<{ income: number; expense: number; balance: number }>;
    updateTransaction: (id: number, t: Omit<Transaction, 'id'>) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshTransactions = useCallback(async (filters?: any) => {
        setLoading(true);
        try {
            const data = await db.getTransactions(filters);
            setTransactions(data);
        } catch (error) {
            console.error('Failed to load transactions', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        db.getDb().then(() => {
            refreshTransactions();
        });
    }, [refreshTransactions]);

    const addTransaction = async (t: Omit<Transaction, 'id'>) => {
        await db.addTransaction(t);
        await refreshTransactions();
    };

    const deleteTransaction = async (id: number) => {
        await db.deleteTransaction(id);
        await refreshTransactions();
    };

    const getDailyStats = async (date: Date) => {
        const s = startOfDay(date).toISOString();
        const e = endOfDay(date).toISOString();
        return await db.getSummary(s, e);
    };

    const getMonthlyStats = async (date: Date) => {
        const s = startOfMonth(date).toISOString();
        const e = endOfMonth(date).toISOString();
        return await db.getSummary(s, e);
    };

    const getHighestSpending = async (date: Date) => {
        const s = date.toISOString();
        const res = await db.getHighestSpendingSource(s);
        return res || null;
    };

    const getHighestExpenseDay = async (date: Date) => {
        const s = startOfMonth(date).toISOString();
        const e = endOfMonth(date).toISOString();
        const res = await db.getHighestExpenseDay(s, e);
        return res || null;
    };

    const getAllTimeStats = async () => {
        return await db.getSummary();
    };

    const updateTransaction = async (id: number, t: Omit<Transaction, 'id'>) => {
        await db.updateTransaction(id, t);
        await refreshTransactions();
    };

    return (
        <TransactionContext.Provider value={{
            transactions,
            loading,
            refreshTransactions,
            addTransaction,
            deleteTransaction,
            getDailyStats,
            getMonthlyStats,
            getHighestSpending,
            getHighestExpenseDay,
            getAllTimeStats,
            updateTransaction
        }}>
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = () => {
    const context = useContext(TransactionContext);
    if (!context) throw new Error('useTransactions must be used within TransactionProvider');
    return context;
};
