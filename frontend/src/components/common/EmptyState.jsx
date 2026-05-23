// src/components/common/EmptyState.jsx
// Empty / error state component with emoji or image illustration.
// Props: emoji, image, title, subtitle, actionLabel, onAction, error

import React from 'react';
import { View, Text, Image } from 'react-native';
import GradientButton from './GradientButton';
import THEME from '../../constants/theme';

export default function EmptyState({
  emoji,
  image,
  title,
  subtitle,
  actionLabel,
  onAction,
  error = false,
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
      }}
    >
      {/* Illustration */}
      {image ? (
        <Image
          source={typeof image === 'string' ? { uri: image } : image}
          style={{ width: 160, height: 160, marginBottom: 20 }}
          resizeMode="contain"
        />
      ) : (
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: error
              ? 'rgba(239,68,68,0.08)'
              : 'rgba(0,188,212,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 44 }}>{emoji || (error ? '⚠️' : '📭')}</Text>
        </View>
      )}

      {/* Title */}
      <Text
        style={{
          fontSize: 20,
          fontFamily: 'Inter-Bold',
          color: THEME.colors.textPrimary,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        {title || (error ? 'Something went wrong' : 'Nothing here yet')}
      </Text>

      {/* Subtitle */}
      {subtitle && (
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Inter-Regular',
            color: THEME.colors.textSecondary,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 28,
          }}
        >
          {subtitle}
        </Text>
      )}

      {/* CTA button */}
      {actionLabel && onAction && (
        <GradientButton
          title={actionLabel}
          onPress={onAction}
          colors={error ? ['#EF4444', '#DC2626'] : THEME.gradients.primary}
          style={{ minWidth: 160, marginTop: subtitle ? 0 : 20 }}
        />
      )}
    </View>
  );
}