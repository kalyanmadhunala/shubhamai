// src/components/common/OccasionChip.jsx
// Selectable chip for occasion quick-picks and filter bars.
// Props: label, selected, onPress, size ('sm' | 'md')

import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import THEME from '../../constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function OccasionChip({ label, selected = false, onPress, size = 'md' }) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn  = () => { scale.value = withSpring(0.94); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  const isSmall   = size === 'sm';
  const padH      = isSmall ? 12 : 16;
  const padV      = isSmall ? 6  : 10;
  const fontSize  = isSmall ? 12 : 14;

  if (selected) {
    return (
      <AnimatedTouchable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
        style={[animStyle, { borderRadius: THEME.radius.full, overflow: 'hidden' }]}
      >
        <LinearGradient
          colors={THEME.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingHorizontal: padH,
            paddingVertical: padV,
            borderRadius: THEME.radius.full,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize,
              fontFamily: 'Inter-SemiBold',
            }}
          >
            {label}
          </Text>
        </LinearGradient>
      </AnimatedTouchable>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
      style={[
        animStyle,
        {
          paddingHorizontal: padH,
          paddingVertical: padV,
          borderRadius: THEME.radius.full,
          borderWidth: 1.5,
          borderColor: 'rgba(0,0,0,0.10)',
          backgroundColor: '#F8F9FA',
        },
      ]}
    >
      <Text
        style={{
          color: THEME.colors.textSecondary,
          fontSize,
          fontFamily: 'Inter-Medium',
        }}
      >
        {label}
      </Text>
    </AnimatedTouchable>
  );
}