// src/components/common/GlassCard.jsx
// Reusable glassmorphism card.
// Uses BlurView when available, falls back to semi-transparent white.

import React from 'react';
import { View, Platform } from 'react-native';
import THEME from '../../constants/theme';

export default function GlassCard({
  children,
  className = '',
  style,
  padding = true,
  radius = THEME.radius.xl,
  blur = true,
  ...props
}) {
  const baseStyle = {
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    ...THEME.shadow.card,
    ...(padding ? { padding: THEME.spacing.cardPad } : {}),
    ...style,
  };

  // Try BlurView — gracefully skip if not linked
  try {
    const { BlurView } = require('@react-native-community/blur');
    if (blur && Platform.OS !== 'android') {
      return (
        <BlurView
          blurType="light"
          blurAmount={18}
          reducedTransparencyFallbackColor="white"
          style={[baseStyle, { overflow: 'hidden' }]}
          {...props}
        >
          {children}
        </BlurView>
      );
    }
  } catch {
    // BlurView not available — use plain View fallback below
  }

  return (
    <View style={baseStyle} className={className} {...props}>
      {children}
    </View>
  );
}