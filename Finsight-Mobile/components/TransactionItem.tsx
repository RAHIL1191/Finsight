import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface TransactionItemProps {
  name: string;
  category: string;
  amount: string;
  date: string;
  type: 'income' | 'expense';
  icon: keyof typeof Ionicons.glyphMap;
  source?: 'manual' | 'plaid' | 'gmail';
  status?: 'cleared' | 'needs_review';
}

export const TransactionItem = ({ name, category, amount, date, type, icon, source = 'manual', status }: TransactionItemProps) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#6C63FF" />
        </View>
        <View>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            {source === 'gmail' && <Ionicons name="mail" size={12} color="#6C63FF" style={styles.sourceIcon} />}
            {source === 'plaid' && <Ionicons name="business" size={12} color="#3B82F6" style={styles.sourceIcon} />}
            {status === 'needs_review' && <View style={styles.reviewDot} />}
          </View>
          <Text style={styles.category}>{category}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={[styles.amount, type === 'income' ? styles.income : styles.expense]}>
          {type === 'income' ? '+' : '-'}{amount}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A38',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#1A1A24',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    maxWidth: 180,
  },
  sourceIcon: {
    marginLeft: 6,
    opacity: 0.8,
  },
  reviewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginLeft: 6,
  },
  category: {
    color: '#8888AA',
    fontSize: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  income: {
    color: '#22C55E',
  },
  expense: {
    color: '#FFFFFF',
  },
  date: {
    color: '#8888AA',
    fontSize: 11,
  },
});
