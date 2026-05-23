// src/components/navigation/BottomNavigation.jsx
// 5-tab nav: Home | Search | ✨ AI (FAB) | Dates | Settings
// CustomPosterGenerationScreen is the AI fab target

import React from 'react';
import { View, TouchableOpacity, Text, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { GRADIENTS, COLORS } from '../../constants/colors';
import { ROUTES } from '../../navigation/routes';

const FALLBACK_BOTTOM_PAD = Platform.OS === 'android' ? 6 : 4;
const BAR_CONTENT_HEIGHT  = 56;

const tabs = [
  { name: 'Home',     icon: '🏠', route: ROUTES.HOME },
  { name: 'Search',  icon: '🔍', route: ROUTES.SEARCH },
  { name: 'AI',      icon: '✨', route: ROUTES.CUSTOM_POSTER, isFab: true },
  { name: 'Dates',   icon: '📅', route: ROUTES.IMPORTANT_DATES },
  { name: 'Settings',icon: '⚙️', route: ROUTES.SETTINGS },
];

export default function BottomNavigation({ activeRoute, navigation }) {
  const { width } = useWindowDimensions();
  const insets    = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, FALLBACK_BOTTOM_PAD);
  const barHeight = BAR_CONTENT_HEIGHT + bottomPad;
  const fabSize   = Math.min(width * 0.14, 60);
  const fabRadius = fabSize / 2;

  return (
    <View
      style={{
        backgroundColor: '#000000',
        height: barHeight,
        paddingBottom: bottomPad,
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderTopLeftRadius: 2,
        borderTopRightRadius: 0,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        zIndex: 100,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeRoute === tab.route;

        if (tab.isFab) {
          return (
            <TouchableOpacity
              key={tab.name}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingBottom: 4,
                height: BAR_CONTENT_HEIGHT,
                justifyContent: 'flex-end',
              }}
              onPress={() => navigation.navigate(tab.route)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: fabSize,
                  height: fabSize,
                  borderRadius: fabRadius,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: -(fabRadius + 8),
                  elevation: 8,
                  shadowColor: COLORS.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 8,
                }}
              >
                <Text style={{ fontSize: fabSize * 0.46 }}>{tab.icon}</Text>
              </LinearGradient>
              <Text
                style={{
                  fontSize: Math.min(width * 0.026, 11),
                  color: COLORS.primary,
                  fontWeight: '700',
                  marginTop: 2,
                }}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.name}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'flex-end',
              height: BAR_CONTENT_HEIGHT,
              paddingBottom: 4,
            }}
            onPress={() => navigation.navigate(tab.route)}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: Math.min(width * 0.058, 24), opacity: isActive ? 1 : 0.4 }}>
              {tab.icon}
            </Text>
            <Text
              style={{
                fontSize: Math.min(width * 0.026, 11),
                color: isActive ? COLORS.primary : COLORS.grey,
                fontWeight: '600',
                marginTop: 1,
              }}
            >
              {tab.name}
            </Text>
            {isActive && (
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: Math.min(width * 0.06, 24), height: 3, borderRadius: 2, marginTop: 2 }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}