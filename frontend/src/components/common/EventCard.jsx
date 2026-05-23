// src/components/common/EventCard.jsx
// Reusable event row card used in Home, Events, Search screens.
// Props: event, onPress, index (optional, for stagger animations)

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import THEME from '../../constants/theme';

// Region badge color map
const REGION_COLORS = {
  telangana:     { bg: '#FFF3E0', text: '#E65100' },
  national:      { bg: '#E8F5E9', text: '#2E7D32' },
  international: { bg: '#E3F2FD', text: '#1565C0' },
  personal:      { bg: '#F3E5F5', text: '#6A1B9A' },
  festival:      { bg: '#FFF8E1', text: '#F57F17' },
  business:      { bg: '#E0F2F1', text: '#00695C' },
  family:        { bg: '#FCE4EC', text: '#880E4F' },
};

function getRegionStyle(region = '') {
  return REGION_COLORS[region.toLowerCase()] || { bg: 'rgba(0,188,212,0.1)', text: '#00BCD4' };
}

export default function EventCard({ event, onPress, index = 0 }) {
  const opacity       = useSharedValue(0);
  const translateY    = useSharedValue(16);

  useEffect(() => {
    opacity.value    = withDelay(index * 60, withTiming(1, { duration: 350, easing: Easing.out(Easing.quad) }));
    translateY.value = withDelay(index * 60, withTiming(0, { duration: 350, easing: Easing.out(Easing.quad) }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const regionStyle = getRegionStyle(event?.region || event?.category || '');

  return (
    <Animated.View style={[animStyle, { marginBottom: 12 }]}>
      <TouchableOpacity
        onPress={() => onPress(event)}
        activeOpacity={0.82}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: THEME.radius.xl,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          minHeight: THEME.size.eventCardH,
          ...THEME.shadow.card,
        }}
      >
        {/* Emoji / icon circle */}
        <LinearGradient
          colors={THEME.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <Text style={{ fontSize: 24 }}>{event?.emoji || '🎉'}</Text>
        </LinearGradient>

        {/* Text content */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: THEME.colors.textPrimary,
              fontSize: 15,
              fontFamily: 'Inter-SemiBold',
              marginBottom: 2,
            }}
            numberOfLines={1}
          >
            {event?.name || event?.title}
          </Text>

          {/* Date */}
          <Text
            style={{
              color: THEME.colors.textSecondary,
              fontSize: 13,
              fontFamily: 'Inter-Regular',
              marginBottom: 6,
            }}
          >
            📅 {event?.date}
          </Text>

          {/* Region / category badge */}
          {(event?.region || event?.category) && (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: regionStyle.bg,
                borderRadius: THEME.radius.full,
                paddingHorizontal: 10,
                paddingVertical: 2,
              }}
            >
              <Text
                style={{
                  color: regionStyle.text,
                  fontSize: 11,
                  fontFamily: 'Inter-SemiBold',
                  textTransform: 'capitalize',
                }}
              >
                {event?.region || event?.category}
              </Text>
            </View>
          )}
        </View>

        {/* Arrow button */}
        <LinearGradient
          colors={THEME.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 10,
          }}
        >
          <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}