// src/screens/main/HomeScreen.jsx
// EXACT UI MATCH TO PROVIDED DESIGN
// React Native CLI + NativeWind + Tailwind CSS
// ONLY UI CHANGED
// ALL FUNCTIONS + API + NAVIGATION PRESERVED

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChevronRight,
  Sparkles,
  CalendarDays,
  CalendarClock,
  CalendarX,
  User,
  Building2,
  Info,
} from 'lucide-react-native';
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
import { COLORS, GRADIENTS } from '../../constants/colors';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';
import { ROUTES } from '../../navigation/routes';

import eventsService from '../../services/api/eventsService';
import { getProfileImage } from '../../utils/profileImage';
import { getInitials, getFirstName, getGreeting } from '../../utils/helpers';
import GradientText from '../../components/common/GradientText';
import { checkProfileAndNavigate } from '../../utils/profileCheck';

export const PROFILE_KEY = 'shubhamai_profile';

const POPULAR_OCCASIONS = [
  { label: '🎂 Birthday' },
  { label: '❤️ Anniversary' },
  { label: '🎊 Festival' },
  { label: '🎉 Congratulations' },
  { label: '🙏 Best Wishes' },
  { label: '💛 Thank You' },
];

const REGION_COLORS = {
  telangana: { bg: 'rgba(0,188,212,0.12)', text: '#00BCD4' },
  national: { bg: 'rgba(107,114,128,0.12)', text: '#6B7280' },
  international: { bg: 'rgba(16,185,129,0.12)', text: '#059669' },
  default: { bg: 'rgba(107,114,128,0.10)', text: '#6B7280' },
};

const getRegionStyle = item => {
  if (item.region) return REGION_COLORS[item.region] || REGION_COLORS.default;
  if (item.category === 'Festival') return REGION_COLORS.telangana;
  return REGION_COLORS.default;
};

const getRegionLabel = item => {
  if (item.region === 'national') return 'India';
  if (item.region)
    return item.region.charAt(0).toUpperCase() + item.region.slice(1);
  return item.category || '';
};

function SectionHeading({ title, onSeeAll }) {
  return (
    <View className="flex-row items-center justify-between px-5 mt-6 mb-3">
      <Text
        className="text-[17px] text-secondary"
        style={{
          fontFamily: 'Inter-Bold',
        }}
      >
        {title}
      </Text>

      {onSeeAll && (
        <TouchableOpacity activeOpacity={0.8} onPress={onSeeAll}>
          <Text
            className="text-[13px]"
            style={{
              color: COLORS.primary,
              fontFamily: 'Inter-SemiBold',
            }}
          >
            See All
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const getMonthDay = dateStr => {
  if (!dateStr) {
    return {
      month: '---',
      day: '--',
    };
  }

  let parsedDate;

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    parsedDate = new Date(dateStr);
  }

  // MM-DD
  else if (/^\d{2}-\d{2}$/.test(dateStr)) {
    parsedDate = new Date(`2000-${dateStr}`);
  } else {
    return {
      month: '---',
      day: '--',
    };
  }

  if (isNaN(parsedDate.getTime())) {
    return {
      month: '---',
      day: '--',
    };
  }

  return {
    month: parsedDate
      .toLocaleString('en-US', {
        month: 'short',
      })
      .toUpperCase(),

    day: String(parsedDate.getDate()).padStart(2, '0'),
  };
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

function TodayEventCard({ event, onPress }) {
  const { month, day } = getMonthDay(event.date);
  const regionStyle = getRegionStyle(event);
  const regionLabel = getRegionLabel(event);

  return (
    <View className="mb-2">
      <TouchableOpacity activeOpacity={1} onPress={() => onPress(event)}>
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
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: moderateScale(14),

                fontFamily: 'Inter-Bold',

                color: '#111827',

                marginBottom: 4,
              }}
              numberOfLines={2}
            >
              {event?.name}
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
                    {formatLabel(event?.country)}
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
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-[34px] h-[34px] rounded-full bg-gray-100 items-center justify-center"
          >
            <ChevronRight size={18} color="#111827" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState(null);
  const [topEvents, setTopEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);

        if (raw) {
          setProfile(JSON.parse(raw));
        }
      } catch {}
    };

    const unsubscribe = navigation.addListener('focus', loadProfile);

    loadProfile();

    return unsubscribe;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const loadImage = async () => {
        const savedImage = await getProfileImage();
        setSelectedImage(savedImage || '');
      };

      loadImage();
    }, []),
  );

  const fetchTodayEvents = useCallback(async () => {
    try {
      const response = await eventsService.getTodayEvents();

      const events = Array.isArray(response?.events) ? response.events : [];

      // Deduplicate frontend safety
      const seen = new Set();

      const uniqueEvents = events.filter(item => {
        const key = `${item.name?.trim()?.toLowerCase()}_${item.date}`;

        if (seen.has(key)) {
          return false;
        }

        seen.add(key);

        return true;
      });

      setTopEvents(uniqueEvents);
    } catch (err) {
      console.log('Today Events Error:', err);

      setTopEvents([]);
    }
  }, []);

  const topPad = Math.max(insets.top, 28);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: event => {
      scrollY.value = event.contentOffset.y;
    },
  });

  //console.log(topEvents);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: scrollY.value > 10 ? '#FFFFFF' : 'transparent',

      shadowColor: '#000',

      shadowOffset: {
        width: 0,
        height: 4,
      },

      shadowRadius: 12,

      shadowOpacity: scrollY.value > 10 ? 0.08 : 0,

      elevation: scrollY.value > 10 ? 2 : 0,
    };
  });

  useEffect(() => {
    const init = async () => {
      setLoadingEvents(true);

      await fetchTodayEvents();

      setLoadingEvents(false);
    };

    init();
  }, [fetchTodayEvents]);

  const handleRefresh = async () => {
    setRefreshing(true);

    await fetchTodayEvents();

    setRefreshing(false);
  };

  const handleEventPress = async event => {
    await checkProfileAndNavigate({
      navigation,
      event,
    });
  };

  const initials = getInitials(profile?.fullName);
  const firstName = getFirstName(profile?.fullName);
  const greeting = getGreeting();

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <Animated.View
        style={[
          {
            paddingTop: topPad + 12,
            paddingBottom: verticalScale(8),
            paddingHorizontal: scale(18),
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
            backgroundColor: 'rgba(255,255,255,0.05)',
            bottom: -20,
            left: 10,
          }}
        />

        {/* TOP BAR */}
        <View className="flex-row items-center justify-between">
          <View className="flex flex-row items-center justify-center">
            <GradientText>
              <Text
                className="text-primary text-[22px]"
                colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.12)']}
                style={{
                  fontFamily: 'Inter-Bold',
                  fontSize: moderateScale(22),
                }}
              >
                ShubhaM.Ai
              </Text>
            </GradientText>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('SettingsTab', {
                screen: ROUTES.PROFILE,
              })
            }
          >
            <View
              style={{
                width: scale(48),
                height: scale(48),
                borderRadius: scale(24),
                overflow: 'hidden',
              }}
            >
              {selectedImage ? (
                <Image
                  source={{ uri: selectedImage }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: scale(24),
                  }}
                  resizeMode="cover"
                />
              ) : (
                <LinearGradient
                  colors={['rgba(0,188,212,0.22)', 'rgba(13,71,161,0.18)']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: scale(24),
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255,255,255,0.25)',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter-Bold',
                      fontSize: moderateScale(16),
                      color: '#0D47A1',
                    }}
                  >
                    {initials === '?' ? 'SM' : initials}
                  </Text>
                </LinearGradient>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
      {/* HEADER */}

      <View className="flex-1 bg-white">
        {/* CONTENT */}
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          className="flex-1 bg-white"
          contentContainerStyle={{
            paddingBottom: verticalScale(30),
            flexGrow: 1,
            backgroundColor: '#ffffff',
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          <View className="bg-white">
            {/* GREETING */}
            <View className="px-5 mb-3">
              <Text
                className="text-black text-[18px] mt-1"
                style={{
                  fontFamily: 'Inter-Bold',
                }}
              >
                {greeting}, {firstName} 👋
              </Text>

              <Text
                className="text-gray-500 text-[12px] mt-1 leading-[18px]"
                style={{
                  fontFamily: 'Inter-Regular',
                }}
              >
                Create stunning posters{'\n'}
                with the power of AI
              </Text>
            </View>
            {/* QUICK ACTIONS */}
            <View className="px-5">
              <Text
                className="text-[15px] text-secondary mb-3"
                style={{
                  fontFamily: 'Inter-Bold',
                }}
              >
                Quick Actions
              </Text>

              {/* AI CARD */}
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('AITab')}
                className="bg-white rounded-3xl p-4 shadow-lg border border-black/5"
              >
                <View className="flex-row items-center">
                  <LinearGradient
                    colors={GRADIENTS.primary}
                    style={{
                      width: scale(54),
                      height: scale(54),
                      borderRadius: scale(28),
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: scale(14),
                    }}
                  >
                    <Sparkles size={24} color="#FFFFFF" />
                  </LinearGradient>

                  <View className="flex-1">
                    <Text
                      className="text-[15px] text-gray-900"
                      style={{
                        fontFamily: 'Inter-Bold',
                      }}
                    >
                      Custom Poster Prompt
                    </Text>

                    <Text
                      className="text-[12px] text-gray-500 mt-1 leading-[18px]"
                      style={{
                        fontFamily: 'Inter-Regular',
                      }}
                    >
                      Generate AI prompts for any{'\n'}
                      occasion in seconds
                    </Text>
                  </View>
                  <View className="w-[34px] h-[34px] rounded-full bg-gray-100 items-center justify-center">
                    <ChevronRight size={18} color="#111827" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* QUICK GRID */}
              <View className="flex-row justify-between mt-4">
                {[
                  {
                    icon: <CalendarDays size={22} color="#0D47A1" />,
                    label: 'All Events',
                    onPress: () =>
                      navigation.navigate(ROUTES.EVENTS, {
                        category: 'all',
                      }),
                  },
                  {
                    icon: <CalendarClock size={22} color="#00BCD4" />,
                    label: 'Important\nDates',
                    onPress: () => navigation.navigate('DatesTab'),
                  },
                  {
                    icon: <User size={22} color="#00BCD4" />,
                    label: 'My Profile',
                    onPress: () =>
                      navigation.navigate('SettingsTab', {
                        screen: ROUTES.PROFILE,
                      }),
                  },
                  {
                    icon: <Building2 size={22} color="#0D47A1" />,
                    label: 'Business\nProfile',
                    onPress: () =>
                      navigation.navigate('SettingsTab', {
                        screen: ROUTES.BUSINESS_PROFILE,
                      }),
                  },
                ].map(item => (
                  <TouchableOpacity
                    key={item.label}
                    activeOpacity={0.85}
                    onPress={item.onPress}
                    className="bg-white shadow-lg border border-black/5 items-center rounded-3xl"
                    style={{
                      width: scale(82),
                      height: scale(100),
                      justifyContent: 'space-between',
                      paddingVertical: scale(10),
                    }}
                  >
                    <View className="w-[40px] h-[40px] rounded-[14px] bg-cyan-50 items-center justify-center mb-2">
                      {item.icon}
                    </View>

                    <View
                      style={{
                        height: scale(28), // fixed text area
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        className="text-[11px] text-gray-700 text-center leading-[14px]"
                        style={{
                          fontFamily: 'Inter-Bold',
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* TODAY EVENTS */}
            <SectionHeading
              title="Today's Events"
              onSeeAll={() =>
                navigation.navigate(ROUTES.EVENTS, {
                  category: 'all',
                })
              }
            />

            <View className="px-5">
              {loadingEvents ? (
                <View className="py-10 items-center">
                  <ActivityIndicator color={COLORS.primary} />
                </View>
              ) : topEvents.length === 0 ? (
                <View className="bg-slate-50 rounded-[24px] py-10 items-center border border-black/5">
                  <CalendarX size={48} color="#00BCD4" />

                  <Text
                    className="text-[16px] text-gray-900 mt-3"
                    style={{
                      fontFamily: 'Inter-Bold',
                    }}
                  >
                    No events today
                  </Text>

                  <Text
                    className="text-[12px] text-gray-500 mt-2 text-center leading-[18px]"
                    style={{
                      fontFamily: 'Inter-Regular',
                    }}
                  >
                    Pull down to refresh or browse{'\n'}
                    all events above
                  </Text>
                </View>
              ) : (
                topEvents.map((event, index) => (
                  <TodayEventCard
                    key={String(event._id || index)}
                    event={event}
                    onPress={handleEventPress}
                  />
                ))
              )}
            </View>

            {/* TIP CARD */}
            <View className="mx-5 mt-5 bg-cyan-50 rounded-[18px] p-4 flex-row items-center justify-center gap-2">
              <Info size={22} color="#00BCD4" />
              <Text
                className="flex-1 text-[11px] text-gray-600 leading-[18px]"
                style={{
                  fontFamily: 'Inter-Regular',
                }}
              >
                Tap any event → get a perfect AI prompt → open ChatGPT or Gemini
                → generate your poster instantly!
              </Text>
            </View>
          </View>
        </Animated.ScrollView>
      </View>
    </View>
  );
}
