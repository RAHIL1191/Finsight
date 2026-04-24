import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BillItemProps {
  name: string;
  amount: string;
  dueDate: string;
  daysUntil: number;
}

export const BillItem = ({ name, amount, dueDate, daysUntil }: BillItemProps) => {
  const isUrgent = daysUntil <= 3;

  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, isUrgent ? styles.urgentIcon : null]}>
          <Ionicons name="calendar-outline" size={20} color={isUrgent ? '#EF4444' : '#6C63FF'} />
        </View>
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.dueDate}>Due {dueDate}</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.amount}>{amount}</Text>
        <Text style={[styles.daysUntil, isUrgent ? styles.urgentText : null]}>
          {daysUntil === 0 ? 'Due Today' : `In ${daysUntil} days`}
        </Text>
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
  urgentIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  dueDate: {
    color: '#8888AA',
    fontSize: 12,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  daysUntil: {
    color: '#8888AA',
    fontSize: 11,
  },
  urgentText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});
