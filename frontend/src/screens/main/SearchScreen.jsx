// src/screens/main/SearchScreen.jsx
// BATCH 3 — UI REDESIGN ONLY
//
// ✅ ALL PRESERVED:
//   CATEGORIES constant, debounce(), SearchEventCard (internal),
//   doSearch(), handleQueryChange(), handleCategoryPress(), applyFilter(),
//   handleEventPress(), all state (query, activeCategory, allEvents,
//   displayEvents, loadingInit, loadingSearch, error), useEffect load logic,
//   navigation.navigate(ROUTES.POSTER, { event }), eventsService calls
//
// ❌ CHANGED (UI only):
//   JSX layout, component structure, styling, visual design
//   FIX: Removed all className props (NativeWind/NavigationContainer conflict)
//   FIX: Categories moved into FlatList ListHeaderComponent (scroll with list)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  FlatList,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
  Image,
  RefreshControl,
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
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  X,
  ChevronRight,
  CalendarDays,
  TriangleAlert,
  RefreshCw,
} from 'lucide-react-native';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { ROUTES } from '../../navigation/routes';
import eventsService from '../../services/api/eventsService';
import { checkProfileAndNavigate } from '../../utils/profileCheck';

// ── PRESERVED: Category definitions ──────────────────────────────────────────
export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'telangana', label: 'Telangana' },
  { id: 'national', label: 'India' },
  { id: 'international', label: 'International' },
];

export const CATEGORY_EMOJIS = {
  all: '🌍',
  telangana: '🏛️',
  national: '🇮🇳',
  international: '🌐',
};

const REGION_COLORS = {
  telangana: { bg: 'rgba(0,188,212,0.10)', text: '#00BCD4' },
  national: { bg: 'rgba(13,71,161,0.10)', text: '#0D47A1' },
  international: { bg: 'rgba(16,185,129,0.10)', text: '#059669' },
  default: { bg: 'rgba(107,114,128,0.10)', text: '#6B7280' },
};

// ── PRESERVED: debounce ───────────────────────────────────────────────────────
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ── Redesigned SearchEventCard ────────────────────────────────────────────────
function SearchEventCard({ event, onPress, index }) {
  const regionStyle = REGION_COLORS[event?.region] || REGION_COLORS.default;

  const pressScale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const eventDate = parseEventDate(event.date);
  const month = eventDate
    ? eventDate
        .toLocaleString('en-US', {
          month: 'short',
        })
        .toUpperCase()
    : '---';

  const day = eventDate ? String(eventDate.getDate()).padStart(2, '0') : '--';

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
            pressScale.value = withSpring(1, { damping: 18, stiffness: 220 });
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
              marginHorizontal: 1,
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.1)',
            }}
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
                  marginTop: 4,
                  width: 45,
                  borderRadius: 8,
                }}
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
            <View style={{ flex: 1, gap: scale(6) }}>
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
                <CalendarDays
                  size={11}
                  color={COLORS.primary}
                  strokeWidth={2}
                />

                <Text
                  style={{
                    fontSize: moderateScale(11),
                    fontFamily: 'Inter-Regular',
                    color: '#6B7280',
                  }}
                >
                  {event.date}
                </Text>

                {!!event.region && (
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
                        fontSize: moderateScale(9),
                        fontFamily: 'Inter-SemiBold',
                        textTransform: 'capitalize',
                      }}
                    >
                      {event.region === 'national' ? 'India' : event.region}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Arrow */}
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: '#F3F4F6',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronRight size={20} color="#111827" />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

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

// ── Main screen ───────────────────────────────────────────────────────────────
export default function SearchScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [allEvents, setAllEvents] = useState([]);
  const [displayEvents, setDisplayEvents] = useState([]);
  const [groupedEvents, setGroupedEvents] = useState(null);
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const [currentYear] = useState(now.getFullYear());

  // ── PRESERVED: load all events on mount ──────────────────────────────────

  const loadAll = async () => {
    setLoadingInit(true);

    setError('');

    try {
      const data = await eventsService.getAllYearEvents();

      const events = Array.isArray(data?.events) ? data.events : [];

      const today = new Date();

      today.setHours(0, 0, 0, 0);

      // Remove duplicates + past events
      const seen = new Set();

      const filtered = events.filter(item => {
        const key = `${item.name?.trim()?.toLowerCase()}_${item.date}`;

        // Duplicate remove
        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        const eventDate = parseEventDate(item.date);

        if (!eventDate) {
          return false;
        }

        eventDate.setHours(0, 0, 0, 0);

        // Keep only today & future
        return eventDate >= today;
      });

      // Sort by nearest upcoming date
      filtered.sort((a, b) => {
        const dateA = parseEventDate(a.date);
        const dateB = parseEventDate(b.date);

        return dateA - dateB;
      });

      // Grouped structure
      const grouped = {
        telangana: [],
        national: [],
        international: [],
      };

      filtered.forEach(event => {
        if (grouped[event.region]) {
          grouped[event.region].push(event);
        }
      });

      setAllEvents(filtered);

      setGroupedEvents(grouped);

      setDisplayEvents(filtered);
    } catch (err) {
      console.log(err);

      setError(err?.response?.data?.message || 'Failed to load events.');
    } finally {
      setLoadingInit(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadAll();

    setRefreshing(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // ── PRESERVED: applyFilter ────────────────────────────────────────────────
  const applyFilter = useCallback((list, category) => {
    if (category === 'all') {
      const grouped = {
        telangana: [],
        national: [],
        international: [],
      };

      list.forEach(event => {
        if (grouped[event.region]) {
          grouped[event.region].push(event);
        }
      });

      setGroupedEvents(grouped);

      setDisplayEvents(list);
    } else {
      setGroupedEvents(null);

      setDisplayEvents(list.filter(ev => ev.region === category));
    }
  }, []);

  // ── PRESERVED: doSearch with debounce ────────────────────────────────────
  const doSearch = useCallback(
    debounce(q => {
      // Empty query
      if (!q.trim()) {
        applyFilter(allEvents, activeCategory);

        setLoadingSearch(false);

        return;
      }

      setLoadingSearch(true);

      const search = q.trim().toLowerCase();

      const filtered = allEvents.filter(event => {
        return (
          event.name?.toLowerCase().includes(search) ||
          event.category?.toLowerCase().includes(search) ||
          event.region?.toLowerCase().includes(search)
        );
      });

      applyFilter(filtered, activeCategory);

      setLoadingSearch(false);
    }, 300),
    [allEvents, activeCategory],
  );

  // ── PRESERVED: handleQueryChange ─────────────────────────────────────────
  const handleQueryChange = text => {
    setQuery(text);

    // Empty search → restore all events
    if (!text.trim()) {
      applyFilter(allEvents, activeCategory);
      setLoadingSearch(false);
      return;
    }

    setLoadingSearch(true);

    doSearch(text);
  };

  // ── PRESERVED: handleCategoryPress ───────────────────────────────────────
  const handleCategoryPress = categoryId => {
    setActiveCategory(categoryId);

    // If search exists
    if (query.trim()) {
      const search = query.trim().toLowerCase();

      const filtered = allEvents.filter(event => {
        return (
          event.name?.toLowerCase().includes(search) ||
          event.category?.toLowerCase().includes(search) ||
          event.region?.toLowerCase().includes(search)
        );
      });

      applyFilter(filtered, categoryId);
    } else {
      applyFilter(allEvents, categoryId);
    }
  };

  // ── PRESERVED: handleEventPress ──────────────────────────────────────────
  const handleEventPress = async event => {
    await checkProfileAndNavigate({
      navigation,
      event,
    });
  };

  const topPad = Math.max(insets.top, 28);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const paddingBottom = interpolate(
      scrollY.value,
      [0, 80],
      [20, 10],
      Extrapolation.CLAMP,
    );

    const shadowOpacity = interpolate(
      scrollY.value,
      [0, 60],
      [0, 0.12],
      Extrapolation.CLAMP,
    );

    return {
      paddingBottom,
      shadowOpacity,
      elevation: shadowOpacity > 0 ? 8 : 0,
    };
  });

  const animatedTitleStyle = useAnimatedStyle(() => {
    const fontSize = interpolate(
      scrollY.value,
      [0, 80],
      [26, 18],
      Extrapolation.CLAMP,
    );

    return {
      fontSize,
    };
  });

  const expandedTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 40],
      [1, 0],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      scrollY.value,
      [0, 80],
      [0, -10],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const collapsedTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [20, 80],
      [0, 1],
      Extrapolation.CLAMP,
    );

    const translateY = interpolate(
      scrollY.value,
      [0, 80],
      [10, 0],
      Extrapolation.CLAMP,
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const animatedTitleContainerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, 80],
      [70, 34],
      Extrapolation.CLAMP,
    );

    return {
      height,
    };
  });

  // ── Category strip (now lives inside FlatList header) ────────────────────

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
        const isActive = activeCategory === cat.id;
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

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* ── Static Header: title + search bar only ── */}
      <Animated.View
        style={[
          {
            paddingTop: topPad + 12,
            paddingBottom: verticalScale(20),
            paddingHorizontal: scale(20),
            backgroundColor: '#FFFFFF',
            zIndex: 99,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowRadius: 12,
          },
          animatedHeaderStyle,
        ]}
      >
        <Animated.View
          style={[
            {
              justifyContent: 'center',
              overflow: 'hidden',
            },
            animatedTitleContainerStyle,
          ]}
        >
          {/* Expanded Layout */}
          <Animated.View
            style={[
              {
                position: 'absolute',
              },
              expandedTitleStyle,
            ]}
          >
            <Text
              style={{
                fontSize: moderateScale(30),
                fontFamily: 'Inter-Bold',
                color: '#0D47A1',
                letterSpacing: -0.7,
              }}
            >
              Search Events
            </Text>

            <Text
              style={{
                fontSize: moderateScale(30),
                fontFamily: 'Inter-Bold',
                color: '#0D47A1',
                letterSpacing: -0.7,
                marginTop: -4,
              }}
            >
              {currentYear}
            </Text>
          </Animated.View>

          {/* Collapsed Layout */}
          <Animated.View
            style={[
              {
                position: 'relative',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              collapsedTitleStyle,
            ]}
          >
            <Text
              style={{
                fontSize: moderateScale(22),
                fontFamily: 'Inter-Bold',
                color: '#0D47A1',
                letterSpacing: -0.5,
              }}
            >
              Search Events
            </Text>

            <Text
              style={{
                fontSize: moderateScale(22),
                fontFamily: 'Inter-Bold',
                color: '#0D47A1',
                marginLeft: scale(8),
                letterSpacing: -0.5,
              }}
            >
              {currentYear}
            </Text>
          </Animated.View>
        </Animated.View>

        <Text
          style={{
            fontSize: moderateScale(13),
            fontFamily: 'Inter-Regular',
            color: '#6B7280',
            marginTop: 3,
            marginBottom: verticalScale(16),
          }}
        >
          Find events to create stunning posters
        </Text>

        {/* Search bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            borderRadius: moderateScale(16),
            height: verticalScale(50),
            paddingHorizontal: scale(16),
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.12,
            shadowRadius: 16,
            elevation: 8,
            gap: scale(10),
          }}
        >
          <Search size={20} color={COLORS.primary} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Search by name, category…"
            placeholderTextColor="#9CA3AF"
            style={{
              flex: 1,
              color: '#111827',
              fontSize: moderateScale(14),
              fontFamily: 'Inter-Regular',
              paddingVertical: 0,
            }}
            returnKeyType="search"
            autoCorrect={false}
          />
          {loadingSearch && (
            <ActivityIndicator size="small" color={COLORS.primary} />
          )}
          {!!query && !loadingSearch && (
            <TouchableOpacity
              onPress={() => {
                setQuery('');
                applyFilter(allEvents, activeCategory);
              }}
              activeOpacity={0.75}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={13} color="#6B7280" strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      {/* ── Scrollable content ── */}
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {loadingInit ? (
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
              onPress={() => {
                setLoadingInit(true);
                setError('');
                eventsService
                  .getEvents('all')
                  .then(data => {
                    const grouped = data.events || {};
                    const flat = [];
                    ['telangana', 'national', 'international'].forEach(
                      region => {
                        (grouped[region] || []).forEach(ev =>
                          flat.push({ ...ev, region }),
                        );
                      },
                    );
                    setAllEvents(flat);
                    setDisplayEvents(flat);
                  })
                  .catch(err => {
                    setError(
                      err?.response?.data?.message || 'Failed to load events.',
                    );
                  })
                  .finally(() => setLoadingInit(false));
              }}
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
                  Retry
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.FlatList
            data={
              activeCategory === 'all'
                ? [
                    ...(groupedEvents?.telangana || []).map(item => ({
                      ...item,
                      __section: 'Telangana',
                    })),

                    ...(groupedEvents?.national || []).map(item => ({
                      ...item,
                      __section: 'India',
                    })),

                    ...(groupedEvents?.international || []).map(item => ({
                      ...item,
                      __section: 'International',
                    })),
                  ]
                : displayEvents
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            keyExtractor={item => String(item._id || item.id || Math.random())}
            renderItem={({ item, index }) => {
              const previousItem =
                index > 0
                  ? (activeCategory === 'all'
                      ? [
                          ...(groupedEvents?.telangana || []).map(i => ({
                            ...i,
                            __section: 'Telangana',
                          })),
                          ...(groupedEvents?.national || []).map(i => ({
                            ...i,
                            __section: 'India',
                          })),
                          ...(groupedEvents?.international || []).map(i => ({
                            ...i,
                            __section: 'International',
                          })),
                        ]
                      : displayEvents)[index - 1]
                  : null;

              const showHeader =
                activeCategory === 'all' &&
                (!previousItem || previousItem.__section !== item.__section);

              return (
                <>
                  {showHeader && (
                    <Text
                      style={{
                        fontSize: moderateScale(18),
                        fontFamily: 'Inter-Bold',
                        color: '#111827',
                        marginTop: verticalScale(14),
                        marginBottom: verticalScale(10),
                      }}
                    >
                      {item.__section}
                    </Text>
                  )}

                  <SearchEventCard
                    event={item}
                    onPress={handleEventPress}
                    index={index}
                  />
                </>
              );
            }}
            // ── Categories + count now scroll with the list ──
            ListHeaderComponent={
              <>
                {CategoryStrip}
                <View style={{ paddingBottom: verticalScale(10) }}>
                  <Text
                    style={{
                      fontSize: moderateScale(12),
                      fontFamily: 'Inter-Regular',
                      color: '#9CA3AF',
                    }}
                  >
                    {displayEvents.length}{' '}
                    {displayEvents.length !== 1 ? 'events' : 'event'} found in{' '}
                    {currentYear}
                  </Text>
                </View>
              </>
            }
            contentContainerStyle={{
              paddingHorizontal: scale(16),
              paddingBottom: verticalScale(120),
              paddingTop: verticalScale(4),
            }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View
                style={{
                  alignItems: 'center',
                  paddingTop: verticalScale(50),
                  paddingHorizontal: scale(32),
                }}
              >
                <Image
                  source={require('../../assets/images/searchresults.png')}
                  resizeMode="contain"
                  style={{
                    width: scale(260),
                    height: scale(260),
                    marginBottom: verticalScale(10),
                  }}
                />

                <Text
                  style={{
                    fontSize: moderateScale(18),
                    fontFamily: 'Inter-Bold',
                    color: '#111827',
                    textAlign: 'center',
                    marginBottom: 8,
                  }}
                >
                  No events found
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
                  Try a different search term or filter category
                </Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
