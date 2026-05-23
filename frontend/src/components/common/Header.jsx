// src/components/common/Header.jsx
// Reusable gradient screen header.
// Props: title, subtitle, onBack, rightElement, showDecorCircles

import React from 'react';
import { View, Text, TouchableOpacity, Platform, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import THEME from '../../constants/theme';

export default function Header({
  title,
  subtitle,
  onBack,
  rightElement,
  showDecorCircles = true,
  children,
}) {
  const insets = useSafeAreaInsets();
  const topPad = Math.max(insets.top, Platform.OS === 'android' ? 28 : 20);

  return (
    <LinearGradient
      colors={THEME.gradients.primary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: topPad + 12,
        paddingBottom: 28,
        paddingHorizontal: THEME.spacing.screenPad,
        overflow: 'hidden',
        ...THEME.shadow.header,
      }}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Decorative circles */}
      {showDecorCircles && (
        <>
          <View
            style={{
              position: 'absolute',
              width: 180,
              height: 180,
              borderRadius: 90,
              top: -50,
              right: -40,
              backgroundColor: 'rgba(255,255,255,0.08)',
            }}
          />
          <View
            style={{
              position: 'absolute',
              width: 110,
              height: 110,
              borderRadius: 55,
              bottom: -30,
              left: 50,
              backgroundColor: 'rgba(255,255,255,0.06)',
            }}
          />
        </>
      )}

      {/* Top row: back button + optional right element */}
      {(onBack || rightElement) && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          {onBack ? (
            <TouchableOpacity
              onPress={onBack}
              activeOpacity={0.8}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.35)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40 }} />
          )}

          {rightElement && rightElement}
        </View>
      )}

      {/* Title + subtitle */}
      {title && (
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 24,
            fontFamily: 'Inter-Bold',
            letterSpacing: 0.3,
          }}
        >
          {title}
        </Text>
      )}
      {subtitle && (
        <Text
          style={{
            color: 'rgba(255,255,255,0.78)',
            fontSize: 14,
            fontFamily: 'Inter-Regular',
            marginTop: 4,
          }}
        >
          {subtitle}
        </Text>
      )}

      {/* Optional extra content (e.g., search bar, tabs) */}
      {children}
    </LinearGradient>
  );
}