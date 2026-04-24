import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface NetWorthCardProps {
  amount: string;
  trend: string;
  trendType: 'up' | 'down';
}

export const NetWorthCard = ({ amount, trend, trendType }: NetWorthCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Net Worth</Text>
      <View style={styles.amountContainer}>
        <Text style={styles.amount}>{amount}</Text>
        <View style={[styles.trendBadge, trendType === 'up' ? styles.trendUp : styles.trendDown]}>
          <Text style={styles.trendText}>{trendType === 'up' ? '▲' : '▼'} {trend}</Text>
        </View>
      </View>
      <View style={styles.chartPlaceholder}>
        {/* In a real production app, we'd use a sparkline chart here */}
        <View style={styles.sparklineMock} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#6C63FF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  trendBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendUp: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  trendDown: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  trendText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  chartPlaceholder: {
    marginTop: 20,
    height: 40,
    justifyContent: 'center',
  },
  sparklineMock: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  }
});
