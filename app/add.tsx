import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar as CalendarIcon, Clock, IndianRupee, Save, Trash2, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { COLORS, SOURCES } from '../constants/AppConstants';
import { useTransactions } from '../context/TransactionContext';

export default function AddTransaction() {
  const { addTransaction, updateTransaction, transactions, deleteTransaction } = useTransactions();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!params.id;

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState(SOURCES[0]);
  const [date, setDate] = useState(new Date());
  const [note, setNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (isEditing && params.id) {
      const transaction = transactions.find(t => t.id === Number(params.id));
      if (transaction) {
        setType(transaction.type);
        setAmount(transaction.amount.toString());
        setSource(transaction.source);
        setDate(new Date(transaction.date));
        setNote(transaction.note || '');
      }
    }
  }, [isEditing, params.id, transactions]);

  const handleSave = async () => {
    if (!amount || isNaN(Number(amount))) {
      alert('Please enter a valid amount');
      return;
    }

    const data = {
      type,
      amount: Number(amount),
      source,
      date: date.toISOString(),
      note,
    };

    if (isEditing && params.id) {
      await updateTransaction(Number(params.id), data);
    } else {
      await addTransaction(data);
    }

    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (params.id) {
              await deleteTransaction(Number(params.id));
              router.back();
            }
          }
        }
      ]
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(newDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'income' && styles.incomeActive]}
            onPress={() => setType('income')}
          >
            <Text style={[styles.typeText, type === 'income' && styles.activeText]}>Income</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'expense' && styles.expenseActive]}
            onPress={() => setType('expense')}
          >
            <Text style={[styles.typeText, type === 'expense' && styles.activeText]}>Expense</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <View style={styles.amountInputContainer}>
            <IndianRupee size={24} color={COLORS.text} />
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Source / App</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={source}
              onValueChange={(itemValue: string) => setSource(itemValue)}
              style={styles.picker}
            >
              {SOURCES.map(s => <Picker.Item key={s} label={s} value={s} />)}
            </Picker>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity
              style={styles.dateTimeBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <CalendarIcon size={20} color={COLORS.primary} />
              <Text style={styles.dateTimeText}>{format(date, 'MMM d, yyyy')}</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity
              style={styles.dateTimeBtn}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={20} color={COLORS.primary} />
              <Text style={styles.dateTimeText}>{format(date, 'h:mm a')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add a note..."
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
          />
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={date}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
      </ScrollView>

      <View style={styles.footer}>
        {isEditing ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Trash2 size={24} color={COLORS.expense} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <X size={20} color={COLORS.textSecondary} />
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Save size={20} color={COLORS.white} />
          <Text style={styles.saveBtnText}>{isEditing ? 'Update' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scroll: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  incomeActive: {
    backgroundColor: COLORS.income,
  },
  expenseActive: {
    backgroundColor: COLORS.expense,
  },
  typeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeText: {
    color: COLORS.white,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    paddingVertical: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  pickerWrapper: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  dateTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  dateTimeText: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  deleteBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    gap: 8,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    gap: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});
