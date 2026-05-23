// src/components/common/CategoryCard.jsx
// Reusable category card used in HomeScreen (2-per-row grid).
// Props: title, image, emoji, isActive, onPress

import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import THEME from '../../constants/theme';

export default function CategoryCard({ title, image, emoji, isActive = false, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        flex: 1,
        minWidth: '45%',
        height: 100,
        borderRadius: THEME.radius.xl,
        overflow: 'hidden',
        ...THEME.shadow.card,
        borderWidth: isActive ? 2.5 : 0,
        borderColor: isActive ? THEME.colors.primary : 'transparent',
      }}
    >
      {image ? (
        <ImageBackground
          source={typeof image === 'string' ? { uri: image } : image}
          style={{ flex: 1, justifyContent: 'flex-end' }}
          imageStyle={{ borderRadius: THEME.radius.xl }}
        >
          {/* Dark overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(13,71,161,0.72)']}
            style={{
              flex: 1,
              justifyContent: 'flex-end',
              padding: 12,
              borderRadius: THEME.radius.xl,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontFamily: 'Inter-Bold',
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
          </LinearGradient>
        </ImageBackground>
      ) : (
        // Fallback: gradient tile with emoji
        <LinearGradient
          colors={isActive ? THEME.gradients.primary : ['#E3F2FD', '#B3E5FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 28 }}>{emoji || '🎉'}</Text>
          <Text
            style={{
              color: isActive ? '#FFFFFF' : THEME.colors.textPrimary,
              fontSize: 13,
              fontFamily: 'Inter-SemiBold',
            }}
            numberOfLines={1}
          >
            {title}
          </Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}