// src/navigation/AppNavigator.jsx
// REDESIGNED: Only CustomTabBar function is changed — all navigation logic,
// stack definitions, route names, and screen assignments are 100% preserved.
// Changes: emoji icons replaced with lucide-react-native, glassmorphism bar,
// larger FAB (68x68), Inter fonts, premium active indicator.

import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import GlassCard from '../components/common/GlassCard';
import {
  House,
  Search,
  Sparkles,
  CalendarDays,
  Settings,
  Astroid,
} from 'lucide-react-native';

import { ROUTES } from './routes';
import { COLORS, GRADIENTS } from '../constants/colors';
import THEME from '../constants/theme';

// ── Screens ───────────────────────────────────────────────────────────────────
import SplashScreen from '../screens/auth/SplashScreen';
import HomeScreen from '../screens/main/HomeScreen';
import EventsScreen from '../screens/main/EventsScreen';
import PosterScreen from '../screens/main/PosterScreen';
import SearchScreen from '../screens/main/SearchScreen';
import CustomPosterGenerationScreen from '../screens/main/CustomPosterGenerationScreen';
import ImportantDatesScreen from '../screens/settings/ImportantDatesScreen';
import SettingScreen from '../screens/settings/SettingScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import BusinessProfileScreen from '../screens/settings/BusinessProfileScreen';
import ManageEventScreen from '../screens/settings/ManageEventScreen';

// ── Navigators ────────────────────────────────────────────────────────────────
const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const AIStack = createNativeStackNavigator();
const DatesStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

// ── Tab definitions (labels + icons — DO NOT change route keys) ───────────────
const TABS = [
  { key: 'HomeTab', label: 'Home', Icon: House, route: ROUTES.HOME },
  { key: 'SearchTab', label: 'Search', Icon: Search, route: ROUTES.SEARCH },
  {
    key: 'AITab',
    label: 'AI',
    Icon: Sparkles,
    route: ROUTES.CUSTOM_POSTER,
    isFab: true,
  },
  {
    key: 'DatesTab',
    label: 'Dates',
    Icon: CalendarDays,
    route: ROUTES.IMPORTANT_DATES,
  },
  {
    key: 'SettingsTab',
    label: 'Settings',
    Icon: Settings,
    route: ROUTES.SETTINGS,
  },
];

// ── REDESIGNED CustomTabBar ───────────────────────────────────────────────────
function CustomTabBar({ state, navigation }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 4);
  const FAB_SIZE = 64;
  const FAB_OFFSET = 22; // how many px the FAB floats above the bar

  return (
    <GlassCard
      blur
      padding={true}
      style={{
        backgroundColor: 'rgba(255,255,255,255)',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        paddingBottom: bottomPad,
        paddingTop: 10,
        flexDirection: 'row',
        alignItems: 'flex-end',

        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)',

        shadowColor: '#00BCD4',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.22,
        shadowRadius: 18,

        elevation: 24,

        zIndex: 100,
        overflow: 'visible',
      }}
    >
      {TABS.map((tab, index) => {
        const isActive = state.index === index;
        const { Icon } = tab;

        // ── Floating AI FAB ───────────────────────────────────────────────────
        if (tab.isFab) {
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => navigation.navigate(tab.key)}
              activeOpacity={0.88}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingBottom: 4,
              }}
            >
              {/* FAB — floats above bar */}
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: FAB_SIZE,
                  height: FAB_SIZE,
                  borderRadius: FAB_SIZE / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -(FAB_SIZE / 2 + FAB_OFFSET),
                  // White ring
                  borderWidth: 3,
                  borderColor: '#FFFFFF',
                  // Glow shadow
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.45,
                  shadowRadius: 14,
                  elevation: 16,
                }}
              >
                <Sparkles size={28} color="#FFFFFF" strokeWidth={2} />
              </LinearGradient>

              <Text
                style={{
                  fontSize: 10,
                  fontFamily: 'Inter-Bold',
                  color: COLORS.primary,
                  marginTop: 4,
                  letterSpacing: 0.3,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        // ── Regular tab ───────────────────────────────────────────────────────
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => {
              const isFocused = state.index === index;

              if (isFocused) {
                navigation.emit({
                  type: 'tabPress',
                  target: state.routes[index].key,
                });
                navigation.jumpTo(tab.key, {
                  screen:
                    tab.key === 'HomeTab'
                      ? ROUTES.HOME
                      : tab.key === 'SearchTab'
                      ? ROUTES.SEARCH
                      : tab.key === 'AITab'
                      ? ROUTES.CUSTOM_POSTER
                      : tab.key === 'DatesTab'
                      ? ROUTES.IMPORTANT_DATES
                      : ROUTES.SETTINGS,
                });
              } else {
                navigation.jumpTo(tab.key);
              }
            }}
            activeOpacity={0.8}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'flex-end',
              paddingBottom: 4,
              paddingTop: 4,
            }}
          >
            {/* Active indicator dot */}
            {isActive && (
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: 24,
                  height: 3,
                  borderRadius: 2,
                  marginBottom: 5,
                }}
              />
            )}

            {/* Icon */}
            <Icon
              size={22}
              color={isActive ? COLORS.primary : '#9CA3AF'}
              strokeWidth={isActive ? 2.2 : 1.8}
            />

            {/* Label */}
            <Text
              style={{
                fontSize: 10,
                fontFamily: isActive ? 'Inter-SemiBold' : 'Inter-Regular',
                color: isActive ? COLORS.primary : '#9CA3AF',
                marginTop: 3,
                letterSpacing: 0.2,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </GlassCard>
  );
}

// ── Per-tab nested stacks (UNCHANGED) ────────────────────────────────────────
const stackOpts = { headerShown: false, animation: 'slide_from_right' };

function HomeTabStack() {
  return (
    <HomeStack.Navigator screenOptions={stackOpts}>
      <HomeStack.Screen name={ROUTES.HOME} component={HomeScreen} />
      <HomeStack.Screen name={ROUTES.EVENTS} component={EventsScreen} />
      <HomeStack.Screen name={ROUTES.POSTER} component={PosterScreen} />
    </HomeStack.Navigator>
  );
}

function SearchTabStack() {
  return (
    <SearchStack.Navigator screenOptions={stackOpts}>
      <SearchStack.Screen name={ROUTES.SEARCH} component={SearchScreen} />
      <SearchStack.Screen name={ROUTES.POSTER} component={PosterScreen} />
    </SearchStack.Navigator>
  );
}

function AITabStack() {
  return (
    <AIStack.Navigator screenOptions={stackOpts}>
      <AIStack.Screen
        name={ROUTES.CUSTOM_POSTER}
        component={CustomPosterGenerationScreen}
      />
      <AIStack.Screen name={ROUTES.POSTER} component={PosterScreen} />
    </AIStack.Navigator>
  );
}

function DatesTabStack() {
  return (
    <DatesStack.Navigator screenOptions={stackOpts}>
      <DatesStack.Screen
        name={ROUTES.IMPORTANT_DATES}
        component={ImportantDatesScreen}
      />
    </DatesStack.Navigator>
  );
}

function SettingsTabStack() {
  return (
    <SettingsStack.Navigator screenOptions={stackOpts}>
      <SettingsStack.Screen name={ROUTES.SETTINGS} component={SettingScreen} />
      <SettingsStack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
      <SettingsStack.Screen
        name={ROUTES.BUSINESS_PROFILE}
        component={BusinessProfileScreen}
      />
      <SettingsStack.Screen
        name={ROUTES.IMPORTANT_DATES}
        component={ImportantDatesScreen}
      />
      <SettingsStack.Screen
        name={ROUTES.MANAGE_EVENTS}
        component={ManageEventScreen}
      />
    </SettingsStack.Navigator>
  );
}

// ── Bottom tab navigator (UNCHANGED logic) ────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        popToTopOnBlur: true,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeTabStack} />
      <Tab.Screen name="SearchTab" component={SearchTabStack} />
      <Tab.Screen name="AITab" component={AITabStack} />
      <Tab.Screen name="DatesTab" component={DatesTabStack} />
      <Tab.Screen name="SettingsTab" component={SettingsTabStack} />
    </Tab.Navigator>
  );
}

// ── Root navigator (UNCHANGED) ────────────────────────────────────────────────
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName={ROUTES.SPLASH}
        screenOptions={{ headerShown: false, animation: 'fade' }}
      >
        <RootStack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
