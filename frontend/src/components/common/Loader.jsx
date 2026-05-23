// src/components/common/Loader.jsx
// REDESIGNED — premium centered loader with gradient spinner ring.
// Preserves: message prop exactly.

import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import THEME from '../../constants/theme';

export default function Loader({ message }) {
  return (
    <View
      style={{
        flex: 1,
        alignItems:     'center',
        justifyContent: 'center',
        backgroundColor: THEME.colors.background,
        gap: 16,
      }}
    >
      {/* Outer ring */}
      <View
        style={{
          width:           72,
          height:          72,
          borderRadius:    36,
          backgroundColor: 'rgba(0,188,212,0.08)',
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        <ActivityIndicator
          size="large"
          color={THEME.colors.primary}
        />
      </View>

      {message && (
        <Text
          style={{
            fontSize:   14,
            fontFamily: 'Inter-Regular',
            color:      THEME.colors.textSecondary,
            textAlign:  'center',
            lineHeight: 22,
            maxWidth:   220,
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}