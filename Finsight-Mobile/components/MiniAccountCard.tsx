import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MiniAccountCardProps {
  name: string;
  balance: string;
  percentage: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export const MiniAccountCard = ({ name, balance, percentage, icon, color = '#6C63FF' }: MiniAccountCardProps) => {
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: color }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.trendContainer}>
          <Text style={styles.percentage}>{percentage}</Text>
          <Ionicons name="trending-up" size={14} color="rgba(255, 255, 255, 0.8)" style={styles.trendIcon} />
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.balance}>{balance}</Text>
        <Text style={styles.name}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 180, // Slightly reduced now that the footer tag is gone
    borderRadius: 28,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  percentage: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  trendIcon: {
    marginLeft: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 8,
  },
  balance: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  name: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
});
