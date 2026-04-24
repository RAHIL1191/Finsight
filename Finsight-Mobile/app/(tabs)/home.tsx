import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Animated } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '@clerk/expo';
import { Ionicons } from '@expo/vector-icons';
import { MiniAccountCard } from '../../components/MiniAccountCard';
import { CashflowCard } from '../../components/CashflowCard';
import { TransactionItem } from '../../components/TransactionItem';
import { BillItem } from '../../components/BillItem';
import { BudgetAlertCard } from '../../components/BudgetAlertCard';
import { useNavigation } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH;

export default function HomeScreen() {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [cashflowPeriod, setCashflowPeriod] = useState<'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [hasNotifications, setHasNotifications] = useState(false);

  // Animation for hiding bottom bar (simplified via parent navigation state if supported, or local mock logic)
  const [lastScrollY, setLastScrollY] = useState(0);

  const accountGroups = [
    { id: 'checking', name: 'Checking', balance: '$12,450.00', percentage: '+2.4%', icon: 'wallet' as const, color: '#6C63FF' },
    { id: 'savings', name: 'Savings', balance: '$24,000.00', percentage: '+1.8%', icon: 'safe' as const, color: '#3B82F6' },
    { id: 'credit', name: 'Credit Cards', balance: '$1,200.00', percentage: '-0.5%', icon: 'card' as const, color: '#10B981' },
  ];

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= accountGroups.length) return;
    scrollRef.current?.scrollTo({ x: index * CARD_WIDTH, animated: true });
    setActiveIndex(index);
  };

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const diff = currentOffset - lastScrollY;
    
    if (currentOffset <= 0) {
      const style = { display: 'flex' as const, backgroundColor: '#1A1A24', borderTopColor: '#2A2A38', height: 70 + (insets.bottom > 0 ? insets.bottom - 10 : 0), paddingBottom: insets.bottom > 0 ? insets.bottom : 12, paddingTop: 12 };
      navigation.getParent()?.setOptions({ tabBarStyle: style });
      navigation.setOptions({ tabBarStyle: style });
    } else if (diff > 10 && currentOffset > 50) {
      // Scrolling down
      const style = { display: 'none' as const };
      navigation.getParent()?.setOptions({ tabBarStyle: style });
      navigation.setOptions({ tabBarStyle: style });
    } else if (diff < -10) {
      // Scrolling up
      const style = { display: 'flex' as const, backgroundColor: '#1A1A24', borderTopColor: '#2A2A38', height: 70 + (insets.bottom > 0 ? insets.bottom - 10 : 0), paddingBottom: insets.bottom > 0 ? insets.bottom : 12, paddingTop: 12 };
      navigation.getParent()?.setOptions({ tabBarStyle: style });
      navigation.setOptions({ tabBarStyle: style });
    }
    
    setLastScrollY(currentOffset);
  };



  return (
    <View style={[styles.container, { backgroundColor: '#0F0F14' }]}>
      {/* Sticky Top Bar Header */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="search-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              {hasNotifications && <View style={styles.notificationDot} />}
            </TouchableOpacity>
            <Image 
              source={{ uri: user?.imageUrl || 'https://via.placeholder.com/150' }} 
              style={styles.avatar} 
            />
          </View>
        </View>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Accounts Paging Section */}
        <View style={styles.accountsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Accounts</Text>
            <View style={styles.arrowControls}>
              <TouchableOpacity 
                onPress={() => scrollToIndex(activeIndex - 1)} 
                disabled={activeIndex === 0}
                style={[styles.arrowButton, activeIndex === 0 && styles.disabledArrow]}
              >
                <Ionicons name="chevron-back" size={20} color={activeIndex === 0 ? '#444' : '#FFFFFF'} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => scrollToIndex(activeIndex + 1)} 
                disabled={activeIndex === accountGroups.length - 1}
                style={[styles.arrowButton, activeIndex === accountGroups.length - 1 && styles.disabledArrow]}
              >
                <Ionicons name="chevron-forward" size={20} color={activeIndex === accountGroups.length - 1 ? '#444' : '#FFFFFF'} />
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView 
            ref={scrollRef}
            horizontal 
            pagingEnabled
            snapToInterval={CARD_WIDTH}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false} 
            onMomentumScrollEnd={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveIndex(Math.round(x / CARD_WIDTH));
            }}
            contentContainerStyle={styles.accountsContainer}
          >
            {accountGroups.map((group) => (
              <View key={group.id} style={styles.fullWidthCardContainer}>
                <MiniAccountCard 
                  name={group.name} 
                  balance={group.balance} 
                  percentage={group.percentage}
                  icon={group.icon}
                  color={group.color} 
                />
              </View>
            ))}
          </ScrollView>
          
          <View style={styles.dotContainer}>
            {accountGroups.map((_, i) => (
              <View 
                key={i} 
                style={[styles.dot, activeIndex === i ? styles.activeDot : null]} 
              />
            ))}
          </View>
        </View>

        <View style={styles.paddedContent}>
          {/* Label showing selected period instead of clickable filters */}
          <View style={styles.periodLabelContainer}>
            <Text style={styles.periodLabelText}>
              {cashflowPeriod.charAt(0).toUpperCase() + cashflowPeriod.slice(1)} Cashflow
            </Text>
          </View>

          <CashflowCard 
            income={cashflowPeriod === 'yearly' ? "$98,400.00" : "$8,400.00"} 
            expenses={cashflowPeriod === 'yearly' ? "$42,200.00" : "$3,200.00"} 
            net={cashflowPeriod === 'yearly' ? "$56,200.00" : "$5,200.00"} 
            isPositive={true} 
          />

          <View style={styles.section}>
            <BudgetAlertCard 
              category="Dining Out" 
              spent="$420.00" 
              limit="$500.00" 
              percentage={84} 
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Bills</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.listContainer}>
              <BillItem 
                name="Adobe Creative Cloud" 
                amount="$54.99" 
                dueDate="Apr 26, 2026" 
                daysUntil={2} 
              />
              <BillItem 
                name="Rent Payment" 
                amount="$1,850.00" 
                dueDate="May 01, 2026" 
                daysUntil={7} 
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.listContainer}>
              <TransactionItem 
                name="Apple Store" 
                category="Electronics" 
                amount="1,299.00" 
                date="Today, 2:45 PM" 
                type="expense" 
                icon="laptop" 
              />
              <TransactionItem 
                name="Salary" 
                category="Income" 
                amount="4,200.00" 
                date="Yesterday" 
                type="income" 
                icon="cash" 
              />
              <TransactionItem 
                name="Starbucks" 
                category="Food & Drink" 
                amount="12.50" 
                date="Apr 22, 2026" 
                type="expense" 
                icon="cafe" 
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Ionicons name="sparkles" size={20} color="#6C63FF" />
                <Text style={styles.insightTitle}>AI Insight</Text>
              </View>
              <Text style={styles.insightText}>
                You've spent 20% more on Dining Out this month compared to March. Try reducing small expenses to hit your $5,000 savings goal faster.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: '#0F0F14',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A24',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for tab bar room
  },
  greeting: {
    color: '#8888AA',
    fontSize: 12,
    fontWeight: '500',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1A1A24',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#1A1A24',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1A1A24',
    marginLeft: 12,
  },
  accountsSection: {
    marginTop: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  arrowControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1A1A24',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  disabledArrow: {
    opacity: 0.3,
  },
  accountsContainer: {
    paddingHorizontal: 0,
  },
  fullWidthCardContainer: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2A2A38',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6C63FF',
    width: 16,
  },
  paddedContent: {
    paddingHorizontal: 20,
  },
  periodLabelContainer: {
    marginBottom: 12,
  },
  periodLabelText: {
    color: '#8888AA',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seeAll: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    backgroundColor: '#1A1A24',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2A2A38',
  },
  insightCard: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  section: {
    marginBottom: 24,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  insightTitle: {
    color: '#6C63FF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  insightText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.9,
  },
});
