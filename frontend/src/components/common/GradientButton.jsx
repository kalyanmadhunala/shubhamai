// src/components/common/GradientButton.jsx
// Drop-in upgrade for PrimaryButton.
// Preserves: onPress, disabled, loading, title props.

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import THEME from '../../constants/theme';

export default function GradientButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  colors = THEME.gradients.primary,
  style,
  textStyle,
  outline = false,
  height = THEME.size.buttonHeight,
}) {
  if (outline) {
    // Outlined / secondary variant
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[{ borderRadius: THEME.radius.full, overflow: 'hidden' }, style]}
      >
        <LinearGradient
          colors={disabled ? ['#E0E0E0', '#E0E0E0'] : colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: THEME.radius.full, padding: 1.5 }}
        >
          <View
            style={{
              height: height - 3,
              borderRadius: THEME.radius.full,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              paddingHorizontal: 28,
              gap: 8,
            }}
          >
            {icon && !loading && icon}
            {loading ? (
              <ActivityIndicator color={THEME.colors.primary} size="small" />
            ) : (
              <Text
                style={[
                  THEME.font.button,
                  { color: THEME.colors.primary },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // Filled / primary variant
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[{ borderRadius: THEME.radius.full, overflow: 'hidden' }, style]}
    >
      <LinearGradient
        colors={
          disabled
            ? ['#B0BEC5', '#90A4AE']
            : colors
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          height,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          paddingHorizontal: 28,
          gap: 8,
        }}
      >
        {icon && !loading && icon}
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text
            style={[
              THEME.font.button,
              { color: '#FFFFFF', letterSpacing: 0.3 },
              textStyle,
            ]}
          >
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}