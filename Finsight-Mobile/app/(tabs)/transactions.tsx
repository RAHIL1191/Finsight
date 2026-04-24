import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CashflowCard } from '../../components/CashflowCard';
import { TransactionItem } from '../../components/TransactionItem';
import { useSync } from '../../hooks/useSync';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { isSyncing, syncAll } = useSync();
  const [activeTab, setActiveTab] = useState<'transactions' | 'cashflow'>('transactions');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');

  const renderFilters = () => (
    <View style={styles.filterContainer}>
      {(['weekly', 'monthly', 'yearly', 'custom'] as const).map((p) => (
        <TouchableOpacity 
          key={p} 
          onPress={() => setPeriod(p)}
          style={[styles.filterChip, period === p && styles.activeFilterChip]}
        >
          <Text style={[styles.filterText, period === p && styles.activeFilterText]}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Sticky Header with Tab Switcher */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerTitle}>Activity</Text>
        <View style={styles.tabSwitcher}>
          <TouchableOpacity 
            onPress={() => setActiveTab('transactions')}
            style={[styles.tabButton, activeTab === 'transactions' && styles.activeTabButton]}
          >
            <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab('cashflow')}
            style={[styles.tabButton, activeTab === 'cashflow' && styles.activeTabButton]}
          >
            <Text style={[styles.tabText, activeTab === 'cashflow' && styles.activeTabText]}>
              Cashflow
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isSyncing} 
            onRefresh={syncAll} 
            tintColor="#6C63FF"
            colors={['#6C63FF']}
          />
        }
      >
        <View style={styles.paddedContent}>
          {activeTab === 'cashflow' ? (
            <>
              {renderFilters()}
              <CashflowCard 
                income={period === 'yearly' ? "$98,400.00" : "$8,400.00"} 
                expenses={period === 'yearly' ? "$42,200.00" : "$3,200.00"} 
                net={period === 'yearly' ? "$56,200.00" : "$5,200.00"} 
                isPositive={true} 
              />
              
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              <View style={styles.breakdownContainer}>
                {/* Mocked breakdown */}
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <Text style={styles.breakdownLabel}>Housing</Text>
                    <Text style={styles.breakdownValue}>$1,850.00</Text>
                  </View>
                  <View style={styles.progressBg}><View style={[styles.progressFill, { width: '45%' }]} /></View>
                </View>
                <View style={styles.breakdownItem}>
                  <View style={styles.breakdownHeader}>
                    <Text style={styles.breakdownLabel}>Food & Drink</Text>
                    <Text style={styles.breakdownValue}>$820.00</Text>
                  </View>
                  <View style={styles.progressBg}><View style={[styles.progressFill, { width: '20%' }]} /></View>
                </View>
              </View>
            </>
          ) : (
            <View>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color="#8888AA" />
                <Text style={styles.searchText}>Search transactions...</Text>
              </View>
              <Text style={styles.sectionTitle}>This Month</Text>
              <View style={styles.listContainer}>
                <TransactionItem 
                  name="Uber Trip" 
                  category="Transport" 
                  amount="24.50" 
                  date="Today, 10:15 AM" 
                  type="expense" 
                  icon="car" 
                  source="gmail"
                  status="needs_review"
                />
                <TransactionItem 
                  name="Netflix" 
                  category="Entertainment" 
                  amount="15.99" 
                  date="Yesterday" 
                  type="expense" 
                  icon="tv" 
                  source="plaid"
                  status="cleared"
                />
                <TransactionItem 
                  name="Apple Store" 
                  category="Electronics" 
                  amount="1,299.00" 
                  date="Apr 22, 2016" 
                  type="expense" 
                  icon="laptop" 
                  source="manual"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  header: {
    backgroundColor: '#1A1A24',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A38',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#0F0F14',
    padding: 4,
    borderRadius: 14,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabButton: {
    backgroundColor: '#1A1A24',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    color: '#8888AA',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  paddedContent: {
    padding: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#1A1A24',
    padding: 4,
    borderRadius: 12,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterChip: {
    backgroundColor: '#6C63FF',
  },
  filterText: {
    color: '#8888AA',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 10,
  },
  listContainer: {
    backgroundColor: '#1A1A24',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A24',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  searchText: {
    color: '#8888AA',
    fontSize: 14,
    marginLeft: 10,
  },
  breakdownContainer: {
    backgroundColor: '#1A1A24',
    borderRadius: 24,
    padding: 20,
  },
  breakdownItem: {
    marginBottom: 20,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  breakdownLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBg: {
    height: 6,
    backgroundColor: '#0F0F14',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C63FF',
    borderRadius: 3,
  }
});
