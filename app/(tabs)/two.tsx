import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { endOfDay, endOfMonth, format, startOfDay, startOfMonth } from 'date-fns';
import { Calendar as CalendarIcon, Filter, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TransactionItem } from '../../components/TransactionItem';
import { COLORS, SOURCES } from '../../constants/AppConstants';
import { useTransactions } from '../../context/TransactionContext';

export default function History() {
  const { transactions, deleteTransaction, refreshTransactions, loading } = useTransactions();
  const [filterType, setFilterType] = useState<string>('');
  const [filterSource, setFilterSource] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');

  useEffect(() => {
    const startDate = viewMode === 'day' ? startOfDay(selectedDate) : startOfMonth(selectedDate);
    const endDate = viewMode === 'day' ? endOfDay(selectedDate) : endOfMonth(selectedDate);

    const filters = {
      type: filterType || undefined,
      source: filterSource || undefined,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
    refreshTransactions(filters);
  }, [filterType, filterSource, selectedDate, viewMode]);

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
    }
  };

  const clearFilters = () => {
    setFilterType('');
    setFilterSource('');
    setSelectedDate(new Date());
    setViewMode('day');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <CalendarIcon size={20} color={COLORS.primary} />
            <Text style={styles.dateText}>
              {viewMode === 'day' ? format(selectedDate, 'MMMM d, yyyy') : format(selectedDate, 'MMMM yyyy')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.viewModeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'day' && styles.modeBtnActive]}
            onPress={() => setViewMode('day')}
          >
            <Text style={[styles.modeText, viewMode === 'day' && styles.modeTextActive]}>Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'month' && styles.modeBtnActive]}
            onPress={() => setViewMode('month')}
          >
            <Text style={[styles.modeText, viewMode === 'month' && styles.modeTextActive]}>Month</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.filterToggle, showFilters && styles.filterToggleActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? COLORS.white : COLORS.primary} />
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {showFilters && (
        <View style={styles.filterSection}>
          <View style={styles.pickerRow}>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Type</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={filterType}
                  onValueChange={(itemValue: string) => setFilterType(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="All" value="" />
                  <Picker.Item label="Income" value="income" />
                  <Picker.Item label="Expense" value="expense" />
                </Picker>
              </View>
            </View>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Source</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={filterSource}
                  onValueChange={(itemValue: string) => setFilterSource(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="All Sources" value="" />
                  {SOURCES.map(s => <Picker.Item key={s} label={s} value={s} />)}
                </Picker>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={clearFilters}>
            <X size={16} color={COLORS.expense} />
            <Text style={styles.clearText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TransactionItem transaction={item} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No transactions found for this {viewMode === 'day' ? 'date' : 'month'}.
            </Text>
          </View>
        }
        refreshing={loading}
        onRefresh={() => refreshTransactions()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  dateSelector: {
    flex: 1.5,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: COLORS.primary,
  },
  modeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modeTextActive: {
    color: COLORS.white,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterToggle: {
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterToggleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterSection: {
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '600',
  },
  pickerWrapper: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    overflow: 'hidden',
    height: 48,
    justifyContent: 'center',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  clearText: {
    color: COLORS.expense,
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    padding: 16,
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
