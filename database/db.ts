import * as SQLite from 'expo-sqlite';
import { Transaction } from '../types';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export const getDb = async () => {
    if (!dbPromise) {
        dbPromise = (async () => {
            const database = await SQLite.openDatabaseAsync('expenses.db');
            await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          type TEXT NOT NULL,
          amount REAL NOT NULL,
          source TEXT NOT NULL,
          date TEXT NOT NULL,
          note TEXT
        );
      `);
            return database;
        })();
    }
    return dbPromise;
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    const database = await getDb();
    const result = await database.runAsync(
        'INSERT INTO transactions (type, amount, source, date, note) VALUES (?, ?, ?, ?, ?)',
        [transaction.type, transaction.amount, transaction.source, transaction.date, transaction.note || '']
    );
    return result.lastInsertRowId;
};

export const getTransactions = async (filters?: {
    startDate?: string;
    endDate?: string;
    type?: string;
    source?: string;
}) => {
    const database = await getDb();
    let query = 'SELECT * FROM transactions';
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (filters?.startDate && filters?.endDate) {
        whereClauses.push('date BETWEEN ? AND ?');
        params.push(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
        whereClauses.push('date >= ?');
        params.push(filters.startDate);
    }

    if (filters?.type) {
        whereClauses.push('type = ?');
        params.push(filters.type);
    }

    if (filters?.source) {
        whereClauses.push('source = ?');
        params.push(filters.source);
    }

    if (whereClauses.length > 0) {
        query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' ORDER BY date DESC';
    return await database.getAllAsync<Transaction>(query, params);
};

export const deleteTransaction = async (id: number) => {
    const database = await getDb();
    await database.runAsync('DELETE FROM transactions WHERE id = ?', id);
};

export const updateTransaction = async (id: number, transaction: Omit<Transaction, 'id'>) => {
    const database = await getDb();
    await database.runAsync(
        'UPDATE transactions SET type = ?, amount = ?, source = ?, date = ?, note = ? WHERE id = ?',
        [transaction.type, transaction.amount, transaction.source, transaction.date, transaction.note || '', id]
    );
};

export const getSummary = async (startDate?: string, endDate?: string) => {
    const database = await getDb();
    let query = 'SELECT type, SUM(amount) as total FROM transactions';
    const params: any[] = [];

    if (startDate && endDate) {
        query += ' WHERE date BETWEEN ? AND ?';
        params.push(startDate, endDate);
    }

    query += ' GROUP BY type';

    const results = await database.getAllAsync<{ type: string; total: number }>(query, params);

    let income = 0;
    let expense = 0;

    results.forEach(row => {
        if (row.type === 'income') income = row.total;
        if (row.type === 'expense') expense = row.total;
    });

    return { income, expense, balance: income - expense };
};

export const getHighestSpendingSource = async (date: string) => {
    const database = await getDb();
    const startOfDay = `${date.split('T')[0]}T00:00:00.000Z`;
    const endOfDay = `${date.split('T')[0]}T23:59:59.999Z`;

    const result = await database.getFirstAsync<{ source: string; total: number }>(
        'SELECT source, SUM(amount) as total FROM transactions WHERE type = "expense" AND date BETWEEN ? AND ? GROUP BY source ORDER BY total DESC LIMIT 1',
        [startOfDay, endOfDay]
    );

    return result;
};
export const getHighestExpenseDay = async (startDate: string, endDate: string) => {
    const database = await getDb();
    const result = await database.getFirstAsync<{ date: string; total: number }>(
        'SELECT substr(date, 1, 10) as date, SUM(amount) as total FROM transactions WHERE type = "expense" AND date BETWEEN ? AND ? GROUP BY date ORDER BY total DESC LIMIT 1',
        [startDate, endDate]
    );
    return result;
};
