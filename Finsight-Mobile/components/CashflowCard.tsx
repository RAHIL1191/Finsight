import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CashflowCardProps {
  income: string;
  expenses: string;
  net: string;
  isPositive: boolean;
}

export const CashflowCard = ({ income, expenses, net, isPositive }: CashflowCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Cashflow</Text>
        <View style={[styles.netBadge, isPositive ? styles.positiveBadge : styles.negativeBadge]}>
          <Text style={[styles.netText, isPositive ? styles.positiveText : styles.negativeText]}>
            {isPositive ? '+' : ''}{net}
          </Text>
        </View>
      </View>
      
      <View style={styles.row}>
        <View style={styles.stat}>
          <View style={[styles.iconContainer, styles.incomeIcon]}>
            <Ionicons name="arrow-down" size={16} color="#22C55E" />
          </View>
          <View>
            <Text style={styles.label}>Inflow</Text>
            <Text style={styles.amount}>{income}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.stat}>
          <View style={[styles.iconContainer, styles.expenseIcon]}>
            <Ionicons name="arrow-up" size={16} color="#EF4444" />
          </View>
          <View>
            <Text style={styles.label}>Outflow</Text>
            <Text style={styles.amount}>{expenses}</Text>
          </View>
        </View>
      </View>

      <View style={styles.progressBarContainer}>
        {/* Simple visual representation of spending vs income */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '45%' }]} /> 
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1A24',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A38',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#8888AA',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  netBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  positiveBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  negativeBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  netText: {
    fontSize: 13,
    fontWeight: '700',
  },
  positiveText: {
    color: '#22C55E',
  },
  negativeText: {
    color: '#EF4444',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  incomeIcon: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  expenseIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  label: {
    color: '#8888AA',
    fontSize: 11,
    marginBottom: 2,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#2A2A38',
    marginHorizontal: 15,
  },
  progressBarContainer: {
    marginTop: 20,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#2A2A38',
    borderRadius: 2,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 2,
  }
});
