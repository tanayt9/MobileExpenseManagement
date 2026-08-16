import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import { CreditCard, DollarSign, ShoppingBag, Wallet } from 'lucide-react-native';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../constants/AppConstants';
import { useTransactions } from '../context/TransactionContext';
import { Transaction } from '../types';

interface TransactionItemProps {
    transaction: Transaction;
}

const getIcon = (source: string, type: string) => {
    const s = source.toLowerCase();
    if (type === 'income') return <DollarSign size={20} color={COLORS.income} />;
    if (s.includes('swiggy') || s.includes('zomato')) return <ShoppingBag size={20} color={COLORS.expense} />;
    if (s.includes('amazon') || s.includes('flipkart') || s.includes('myntra')) return <CreditCard size={20} color={COLORS.expense} />;
    return <Wallet size={20} color={type === 'income' ? COLORS.income : COLORS.expense} />;
};

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
    const isExpense = transaction.type === 'expense';
    const router = useRouter();
    const { deleteTransaction } = useTransactions();

    const handleLongPress = () => {
        Alert.alert(
            "Delete Transaction",
            "Are you sure you want to delete this transaction?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        await deleteTransaction(transaction.id);
                    }
                }
            ]
        );
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => router.push({ pathname: '/add', params: { id: transaction.id.toString() } })}
            onLongPress={handleLongPress}
        >
            <View style={[styles.iconBox, { backgroundColor: isExpense ? '#FEF2F2' : '#F0FDF4' }]}>
                {getIcon(transaction.source, transaction.type)}
            </View>
            <View style={styles.details}>
                <Text style={styles.source}>{transaction.source}</Text>
                <Text style={styles.date}>{format(new Date(transaction.date), 'MMM d, h:mm a')}</Text>
            </View>
            <View style={styles.amountContainer}>
                <Text style={[styles.amount, { color: isExpense ? COLORS.expense : COLORS.income }]}>
                    {isExpense ? '-' : '+'}₹{transaction.amount.toLocaleString()}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.white,
        borderRadius: 16,
        marginBottom: 12,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        flex: 1,
        marginLeft: 16,
    },
    source: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text,
    },
    date: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 16,
        fontWeight: '700',
    },
});
