import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BudgetAlertCardProps {
  category: string;
  spent: string;
  limit: string;
  percentage: number;
}

export const BudgetAlertCard = ({ category, spent, limit, percentage }: BudgetAlertCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="warning" size={18} color="#F59E0B" />
          <Text style={styles.title}>Budget Alert: {category}</Text>
        </View>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.min(percentage, 100)}%` }]} />
      </View>
      <Text style={styles.detail}>
        You've spent <Text style={styles.spent}>{spent}</Text> of your {limit} limit.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  percentage: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBg: {
    height: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 3,
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 3,
  },
  detail: {
    color: '#8888AA',
    fontSize: 12,
  },
  spent: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
