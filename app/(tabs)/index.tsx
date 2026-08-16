import { format } from 'date-fns';
import { Link } from 'expo-router';
import { Flame, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { BalanceSection } from '../../components/BalanceSection';
import { Card } from '../../components/Card';
import { TransactionItem } from '../../components/TransactionItem';
import { COLORS } from '../../constants/AppConstants';
import { useTransactions } from '../../context/TransactionContext';

export default function Dashboard() {
  const { transactions, getDailyStats, getMonthlyStats, getHighestExpenseDay, getAllTimeStats, loading } = useTransactions();
  const [dailyStats, setDailyStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [monthlyStats, setMonthlyStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [allTimeStats, setAllTimeStats] = useState({ income: 0, expense: 0, balance: 0 });
  const [highestDay, setHighestDay] = useState<{ date: string; total: number } | null>(null);

  const fetchData = async () => {
    const today = new Date();
    const ds = await getDailyStats(today);
    const ms = await getMonthlyStats(today);
    const hd = await getHighestExpenseDay(today);
    const as = await getAllTimeStats();

    setDailyStats(ds);
    setMonthlyStats(ms);
    setHighestDay(hd);
    setAllTimeStats(as);
  };

  useEffect(() => {
    fetchData();
  }, [loading, transactions]); // Update when transactions change

  const chartData = {
    labels: ['Inc', 'Exp'],
    datasets: [
      {
        data: [monthlyStats.income || 0, monthlyStats.expense || 0],
      },
    ],
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello!</Text>
            <Text style={styles.date}>{format(new Date(), 'EEEE, do MMMM')}</Text>
          </View>
        </View>

        <BalanceSection
          income={allTimeStats.income}
          expense={allTimeStats.expense}
          balance={allTimeStats.balance}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
        </View>

        <View style={styles.row}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Exp Today</Text>
            <Text style={[styles.statValue, { color: COLORS.expense }]}>₹{dailyStats.expense.toLocaleString()}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Inc Today</Text>
            <Text style={[styles.statValue, { color: COLORS.income }]}>₹{dailyStats.income.toLocaleString()}</Text>
          </Card>
        </View>

        {highestDay && (
          <Card style={styles.highlightCard}>
            <View style={styles.highlightHeader}>
              <Flame size={20} color={COLORS.expense} fill={COLORS.expense} />
              <Text style={styles.highlightTitle}>Highest Spent This Month</Text>
            </View>
            <Text style={styles.highlightSource}>{format(new Date(highestDay.date), 'EEEE, do MMMM')}</Text>
            <Text style={styles.highlightAmount}>₹{highestDay.total.toLocaleString()}</Text>
          </Card>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <Link href="/two" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {recentTransactions.map(t => (
          <TransactionItem key={t.id} transaction={t} />
        ))}

        {recentTransactions.length === 0 && (
          <Text style={styles.emptyText}>No transactions yet.</Text>
        )}

        <Card style={styles.chartCard} >
          <Text style={styles.chartTitle}>Monthly Comparison</Text>
          <BarChart
            data={chartData}
            width={Dimensions.get('window').width - 64}
            height={200}
            yAxisLabel="₹"
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: COLORS.card,
              backgroundGradientFrom: COLORS.card,
              backgroundGradientTo: COLORS.card,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => COLORS.textSecondary,
              style: {
                borderRadius: 16,
              },
              propsForLabels: {
                fontSize: 12,
              },
              fillShadowGradient: COLORS.primary,
              fillShadowGradientOpacity: 1,
            }}
            verticalLabelRotation={0}
            style={styles.chart}
            showValuesOnTopOfBars
            fromZero
          />
        </Card>
      </ScrollView>

      <Link href="/add" asChild>
        <TouchableOpacity style={styles.fab}>
          <Plus color={COLORS.white} size={32} />
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginVertical: 20,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  highlightCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  highlightSource: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  highlightAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.expense,
    marginTop: 4,
  },
  chartCard: {
    marginTop: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: COLORS.primary,
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
