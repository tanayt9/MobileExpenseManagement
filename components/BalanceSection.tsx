import { TrendingDown, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../constants/AppConstants';

interface BalanceSectionProps {
    income: number;
    expense: number;
    balance: number;
}

export const BalanceSection: React.FC<BalanceSectionProps> = ({ income, expense, balance }) => (
    <View style={styles.container}>
        <View style={styles.mainBalance}>
            <Text style={styles.label}>Total Balance</Text>
            <Text style={styles.balanceAmount}>₹{balance.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
            <View style={[styles.statsCard, { borderLeftColor: COLORS.income }]}>
                <View style={styles.iconContainer}>
                    <TrendingUp size={20} color={COLORS.income} />
                </View>
                <Text style={styles.statsLabel}>Income</Text>
                <Text style={[styles.statsAmount, { color: COLORS.income }]}>₹{income.toLocaleString()}</Text>
            </View>
            <View style={[styles.statsCard, { borderLeftColor: COLORS.expense }]}>
                <View style={styles.iconContainer}>
                    <TrendingDown size={20} color={COLORS.expense} />
                </View>
                <Text style={styles.statsLabel}>Expenses</Text>
                <Text style={[styles.statsAmount, { color: COLORS.expense }]}>₹{expense.toLocaleString()}</Text>
            </View>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
    },
    mainBalance: {
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: COLORS.primary,
        padding: 24,
        borderRadius: 24,
    },
    label: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    balanceAmount: {
        color: COLORS.white,
        fontSize: 36,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statsCard: {
        flex: 1,
        backgroundColor: COLORS.white,
        padding: 16,
        borderRadius: 16,
        borderLeftWidth: 4,
    },
    iconContainer: {
        marginBottom: 8,
    },
    statsLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        marginBottom: 4,
    },
    statsAmount: {
        fontSize: 18,
        fontWeight: '600',
    },
});
