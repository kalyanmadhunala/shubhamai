// src/screens/main/EventsScreen.jsx
// BATCH 3 — UI REDESIGN ONLY
//
// ✅ ALL PRESERVED:
//   REGION_META, SECTION_ORDER, SECTION_META constants,
//   fetchEvents(), handleRefresh(), handleEventPress(), buildAllData(),
//   renderItem(), keyExtractor(), all state (loading, refreshing, error,
//   grouped, flatList), useCallback, useEffect async logic, region routing,
//   eventsService.getEvents(), RefreshControl, navigation.navigate(ROUTES.POSTER)
//
// ❌ CHANGED (UI only):
//   JSX layout, component structure, styling, visual design

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ChevronRight,
  CalendarDays,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react-native';
import { BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { ROUTES } from '../../navigation/routes';
import eventsService from '../../services/api/eventsService';
import { toast } from 'sonner-native';
import { CATEGORIES, CATEGORY_EMOJIS } from './SearchScreen';
import { checkProfileAndNavigate } from '../../utils/profileCheck';

// ── PRESERVED: Region display metadata ───────────────────────────────────────
const REGION_META = {
  all: { label: 'All Events', emoji: '🌍', color: '#00BCD4' },
  telangana: { label: 'Telangana Events', emoji: '🏛️', color: '#7C3AED' },
  national: { label: 'India Events', emoji: '🇮🇳', color: '#059669' },
  international: {
    label: 'International Events',
    emoji: '🌐',
    color: '#0D47A1',
  },
};

// ── PRESERVED: Section grouping order ────────────────────────────────────────
const SECTION_ORDER = ['telangana', 'national', 'international'];

const SECTION_META = {
  telangana: { label: 'Telangana', emoji: '🏛️' },
  national: { label: 'India', emoji: '🇮🇳' },
  international: { label: 'International', emoji: '🌐' },
};

const REGION_COLORS = {
  telangana: { bg: 'rgba(0,188,212,0.10)', text: '#00BCD4' },
  national: { bg: 'rgba(13,71,161,0.10)', text: '#0D47A1' },
  international: { bg: 'rgba(16,185,129,0.10)', text: '#059669' },
  default: { bg: 'rgba(107,114,128,0.10)', text: '#6B7280' },
};

const parseEventDate = dateStr => {
  if (!dateStr) {
    return null;
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }

  // MM-DD
  if (/^\d{2}-\d{2}$/.test(dateStr)) {
    const currentYear = new Date().getFullYear();

    return new Date(`${currentYear}-${dateStr}`);
  }

  return null;
};

const formatLabel = text => {
  if (!text) {
    return '';
  }

  return text
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// ── Redesigned EventCard ──────────────────────────────────────────────────────

function EventCard({ event, onPress, index, monthLabel, date }) {
  const regionStyle = REGION_COLORS[event?.region] || REGION_COLORS.default;

  const pressScale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  let eventDate;

  if (/^\d{4}-\d{2}-\d{2}$/.test(event.date)) {
    eventDate = new Date(event.date);
  } else if (/^\d{2}-\d{2}$/.test(event.date)) {
    eventDate = new Date(`2000-${event.date}`);
  } else {
    eventDate = new Date();
  }

  const month = eventDate
    .toLocaleString('en-US', { month: 'short' })
    .toUpperCase();

  const day = String(eventDate.getDate()).padStart(2, '0');

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).duration(450)}
      style={{ marginBottom: scale(10) }}
    >
      <Animated.View style={animStyle}>
        <TouchableOpacity
          onPress={() => onPress(event)}
          onPressIn={() => {
            pressScale.value = withSpring(0.96, {
              damping: 18,
              stiffness: 220,
            });
          }}
          onPressOut={() => {
            pressScale.value = withSpring(1, {
              damping: 18,
              stiffness: 220,
            });
          }}
          activeOpacity={1}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: moderateScale(22),
              paddingHorizontal: scale(14),
              paddingVertical: scale(13),
            }}
            className="border border-black/10 mx-1"
          >
            {/* Date Card */}
            <View
              style={{
                width: scale(58),
                height: scale(64),

                borderRadius: scale(12),

                backgroundColor: '#F9F8FF',

                borderWidth: 1,
                borderColor: 'rgba(13,71,161,0.08)',

                alignItems: 'center',

                overflow: 'hidden',

                marginRight: scale(12),
              }}
            >
              {/* Month */}
              <View
                style={{
                  backgroundColor: '#0D47A1',

                  paddingVertical: verticalScale(4),

                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                className="mt-1 w-[45px] rounded-lg"
              >
                <Text
                  style={{
                    color: '#FFFFFF',

                    fontSize: moderateScale(10),

                    fontFamily: 'Inter-Bold',

                    letterSpacing: 0.8,
                  }}
                >
                  {month}
                </Text>
              </View>

              {/* Day */}
              <View
                style={{
                  flex: 1,

                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#0D47A1',

                    fontSize: moderateScale(22),

                    fontFamily: 'Inter-Bold',

                    lineHeight: moderateScale(24),
                  }}
                >
                  {day}
                </Text>
              </View>
            </View>

            {/* Event Info */}
            <View style={{ flex: 1 }} className="flex flex-col gap-2">
              <Text
                style={{
                  fontSize: moderateScale(14),
                  fontFamily: 'Inter-Bold',
                  color: '#111827',
                  marginBottom: 3,
                }}
                numberOfLines={2}
              >
                {event.name}
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: scale(6),
                  flexWrap: 'wrap',
                }}
              >
                {!!(event.country || event.emoji) && (
                  <View
                    style={{
                      backgroundColor: regionStyle.bg,
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: regionStyle.text,
                        fontSize: moderateScale(10),
                        fontFamily: 'Inter-SemiBold',
                        textTransform: 'capitalize',
                      }}
                    >
                      {formatLabel(event.country || event.emoji)}
                    </Text>
                  </View>
                )}
                {event.region && (
                  <View
                    style={{
                      backgroundColor: regionStyle.bg,
                      borderRadius: 999,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: regionStyle.text,
                        fontSize: moderateScale(10),
                        fontFamily: 'Inter-SemiBold',
                        textTransform: 'capitalize',
                      }}
                    >
                      {formatLabel(event.region)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Arrow */}
            <View className="w-[34px] h-[34px] rounded-full bg-gray-100 items-center justify-center">
              <ChevronRight size={20} color="#111827" />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

// ── Redesigned SectionHeader ──────────────────────────────────────────────────

function SectionHeader({ regionKey }) {
  const meta = SECTION_META[regionKey];
  if (!meta) return null;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(4),
        marginBottom: scale(10),
        marginTop: scale(20),
        gap: scale(8),
      }}
    >
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: 4,
          height: scale(20),
          borderRadius: 2,
        }}
      />
      <Text style={{ fontSize: moderateScale(16) }}>{meta.emoji}</Text>
      <Text
        style={{
          fontSize: moderateScale(15),
          fontFamily: 'Inter-Bold',
          color: '#111827',
          letterSpacing: -0.2,
        }}
      >
        {meta.label}
      </Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function EventsScreen({ navigation, route }) {
  // ── PRESERVED: hook + state ───────────────────────────────────────────────
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const initialRegion = route?.params?.category || 'all';

  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const meta = REGION_META[selectedRegion] || REGION_META.all;

  const now = new Date();
  const [currentMonth] = useState(now.getMonth() + 1);
  const [currentYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [grouped, setGrouped] = useState(null);
  const [flatList, setFlatList] = useState([]);
  const [allGroupedEvents, setAllGroupedEvents] = useState({
    telangana: [],
    national: [],
    international: [],
  });

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('HomeTab', {
            screen: ROUTES.HOME,
          });
        }

        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  const handleCategoryPress = categoryId => {
    setSelectedRegion(categoryId);

    // ALL
    if (categoryId === 'all') {
      setGrouped(allGroupedEvents);

      setFlatList([]);

      return;
    }

    // Single region
    setGrouped(null);

    setFlatList(allGroupedEvents?.[categoryId] || []);
  };

  const CategoryStrip = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: verticalScale(12),
        gap: scale(8),
      }}
    >
      {CATEGORIES.map(cat => {
        const isActive = selectedRegion === cat.id;
        const emoji = CATEGORY_EMOJIS[cat.id];

        return isActive ? (
          <TouchableOpacity
            key={cat.id}
            onPress={() => handleCategoryPress(cat.id)}
            activeOpacity={0.9}
            style={{ borderRadius: 999 }}
          >
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: scale(14),
                paddingVertical: scale(8),
                borderRadius: 999,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              <Text
                style={{ fontSize: moderateScale(12), marginRight: scale(4) }}
              >
                {emoji}
              </Text>
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: moderateScale(12),
                  fontFamily: 'Inter-SemiBold',
                }}
              >
                {cat.label}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            key={cat.id}
            onPress={() => handleCategoryPress(cat.id)}
            activeOpacity={0.85}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: scale(14),
              paddingVertical: scale(8),
              borderRadius: 999,
              borderWidth: 1.5,
              backgroundColor: '#FFFFFF',
              borderColor: 'rgba(0,0,0,0.08)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Text
              style={{ fontSize: moderateScale(12), marginRight: scale(4) }}
            >
              {emoji}
            </Text>
            <Text
              style={{
                color: '#6B7280',
                fontSize: moderateScale(12),
                fontFamily: 'Inter-Medium',
              }}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  // ── PRESERVED: fetchEvents ────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setError('');

    try {
      const response = await eventsService.getEvents({
        month: currentMonth,
        year: currentYear,
        region: 'all',
      });

      const data = response?.events || {};

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      // Helper
      const filterUpcoming = list => {
        return (Array.isArray(list) ? list : [])
          .filter(event => {
            const eventDate = parseEventDate(event.date);

            if (!eventDate) {
              return false;
            }

            eventDate.setHours(0, 0, 0, 0);

            return eventDate >= today;
          })
          .sort((a, b) => {
            const dateA = parseEventDate(a.date);
            const dateB = parseEventDate(b.date);

            return dateA - dateB;
          });
      };

      const groupedData = {
        telangana: filterUpcoming(data?.telangana),

        national: filterUpcoming(data?.national),

        international: filterUpcoming(data?.international),
      };

      // Store master grouped state
      setAllGroupedEvents(groupedData);

      // Initial display
      setGrouped(groupedData);

      setFlatList([]);
    } catch (err) {
      console.log('Fetch Events Error:', err);

      setError(err?.response?.data?.message || 'Failed to load events.');
    }
  }, [currentMonth, currentYear]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchEvents();
      setLoading(false);
    };
    load();
  }, [fetchEvents]);

  // ── PRESERVED: handleRefresh ──────────────────────────────────────────────
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
    toast.success('Data fetched successfully');
  };

  // ── PRESERVED: handleEventPress ──────────────────────────────────────────
  const handleEventPress = async event => {
    await checkProfileAndNavigate({
      navigation,
      event,
    });
  };

  // ── PRESERVED: buildAllData ───────────────────────────────────────────────
  const buildAllData = () => {
    if (!grouped) return [];
    const rows = [];
    SECTION_ORDER.forEach(key => {
      const items = grouped[key] || [];
      if (items.length > 0) {
        rows.push({ type: 'section', key, _id: `section_${key}` });
        items.forEach(ev => rows.push({ type: 'event', ...ev }));
      }
    });
    return rows;
  };

  const allData = selectedRegion === 'all' ? buildAllData() : flatList;

  // ── PRESERVED: renderItem ─────────────────────────────────────────────────
  const renderItem = ({ item, index }) => {
    if (item.type === 'section') return <SectionHeader regionKey={item.key} />;
    return (
      <EventCard
        event={item}
        monthLabel={monthLabel}
        onPress={handleEventPress}
        index={index}
      />
    );
  };

  // ── PRESERVED: keyExtractor ───────────────────────────────────────────────
  const keyExtractor = item =>
    item.type === 'section'
      ? item._id
      : String(item._id || item.id || Math.random());

  const topPad = Math.max(insets.top, 28);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      backgroundColor:
        scrollY.value > 10 ? 'rgba(255,255,255,1)' : 'transparent',
      shadowOpacity: scrollY.value > 10 ? 0.08 : 0,
      elevation: scrollY.value > 10 ? 6 : 0,
    };
  });

  // ── Month/year display label ──────────────────────────────────────────────
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthLabel = `${monthNames[currentMonth - 1]} ${currentYear}`;

  // ── Redesigned JSX ───────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* ── Gradient Header ── */}
      <Animated.View
        style={[
          {
            paddingTop: topPad + 12,
            paddingBottom: verticalScale(20),
            paddingHorizontal: scale(20),
            overflow: 'hidden',
            zIndex: 99,
          },
          animatedHeaderStyle,
        ]}
      >
        <View
          style={{
            position: 'absolute',
            width: scale(120),
            height: scale(120),
            borderRadius: scale(60),
            bottom: -scale(20),
            left: scale(40),
          }}
        />

        {/* Title row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: scale(12),
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: moderateScale(22),
                fontFamily: 'Inter-Bold',
                letterSpacing: -0.4,
              }}
              className="text-secondary"
            >
              {meta.label}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: scale(4),
                marginTop: 3,
              }}
            >
              <CalendarDays
                size={12}
                strokeWidth={2}
                className="text-gray-500"
              />
              <Text
                style={{
                  fontSize: moderateScale(12),
                  fontFamily: 'Inter-Regular',
                }}
                className="text-gray-500"
              >
                {monthLabel}
              </Text>
            </View>
          </View>
          {/* Region icon circle */}
          <View
            style={{
              width: scale(52),
              height: scale(52),
              borderRadius: scale(26),

              backgroundColor: 'rgba(0,188,212,0.12)',

              borderWidth: 1.5,
              borderColor: 'rgba(0,188,212,0.28)',

              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(24),
              }}
            >
              {meta.emoji}
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── White content card ── */}
      <View
        style={{
          flex: 1,
          backgroundColor: '#F5F7FA',
          marginTop: -verticalScale(12),
          overflow: 'hidden',
        }}
      >
        {loading ? (
          // ── Loading state ──
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              gap: scale(12),
            }}
          >
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text
              style={{
                fontSize: moderateScale(13),
                fontFamily: 'Inter-Regular',
                color: '#9CA3AF',
              }}
            >
              Loading events…
            </Text>
          </View>
        ) : error ? (
          // ── Error state ──
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: scale(32),
            }}
          >
            <View
              style={{
                width: scale(96),
                height: scale(96),
                borderRadius: scale(48),
                backgroundColor: 'rgba(239,68,68,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: verticalScale(20),
              }}
            >
              <TriangleAlert
                size={scale(40)}
                color="#EF4444"
                strokeWidth={1.8}
              />
            </View>

            <Text
              style={{
                fontSize: moderateScale(18),
                fontFamily: 'Inter-Bold',
                color: '#111827',
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              Something went wrong
            </Text>
            <Text
              style={{
                fontSize: moderateScale(13),
                fontFamily: 'Inter-Regular',
                color: '#6B7280',
                textAlign: 'center',
                lineHeight: 20,
                marginBottom: verticalScale(24),
              }}
            >
              {error}
            </Text>

            <TouchableOpacity
              onPress={handleRefresh}
              activeOpacity={0.85}
              style={{ borderRadius: 999, overflow: 'hidden' }}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: scale(28),
                  paddingVertical: scale(14),
                  borderRadius: 999,
                  gap: scale(8),
                }}
              >
                <RefreshCw size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: moderateScale(15),
                    fontFamily: 'Inter-SemiBold',
                  }}
                >
                  Try Again
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          // ── Events FlatList ──
          <View>
            <Animated.FlatList
              onScroll={scrollHandler}
              scrollEventThrottle={16}
              ListHeaderComponent={
                <>
                  {CategoryStrip}

                  <View
                    style={{
                      paddingBottom: verticalScale(10),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(12),
                        fontFamily: 'Inter-Regular',
                        color: '#9CA3AF',
                      }}
                    >
                      {selectedRegion === 'all'
                        ? (grouped?.telangana?.length || 0) +
                          (grouped?.national?.length || 0) +
                          (grouped?.international?.length || 0)
                        : flatList.length}{' '}
                      {(selectedRegion === 'all'
                        ? (grouped?.telangana?.length || 0) +
                          (grouped?.national?.length || 0) +
                          (grouped?.international?.length || 0)
                        : flatList.length) !== 1
                        ? 'events'
                        : 'event'}{' '}
                      found in {monthLabel}
                    </Text>
                  </View>
                </>
              }
              data={allData}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={{
                paddingHorizontal: scale(16),
                paddingTop: verticalScale(1),
                paddingBottom: verticalScale(120),
              }}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={[COLORS.primary]}
                  tintColor={COLORS.primary}
                />
              }
              ListEmptyComponent={
                <View
                  style={{
                    alignItems: 'center',
                    paddingTop: verticalScale(60),
                    paddingHorizontal: scale(32),
                  }}
                >
                  <View
                    style={{
                      width: scale(90),
                      height: scale(90),
                      borderRadius: scale(45),
                      backgroundColor: 'rgba(0,188,212,0.08)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: verticalScale(16),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: moderateScale(38),
                      }}
                    >
                      📭
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontSize: moderateScale(17),
                      fontFamily: 'Inter-Bold',
                      color: '#111827',
                      textAlign: 'center',
                      marginBottom: 8,
                    }}
                  >
                    No Events Found
                  </Text>

                  <Text
                    style={{
                      fontSize: moderateScale(13),
                      fontFamily: 'Inter-Regular',
                      color: '#9CA3AF',
                      textAlign: 'center',
                      lineHeight: 20,
                    }}
                  >
                    No upcoming events for this month. Pull down to refresh.
                  </Text>
                </View>
              }
            />
          </View>
        )}
      </View>
    </View>
  );
}
