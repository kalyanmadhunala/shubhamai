// src/components/common/BackButton.jsx
// REDESIGNED — uses lucide ArrowLeft icon.
// Preserves: onPress prop exactly.

import React from 'react';
import { TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import { GRADIENTS } from '../../constants/colors';
import THEME from '../../constants/theme';

export default function BackButton({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      style={{
        width:  44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        alignSelf: 'flex-start',
      }}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.30)', 'rgba(255,255,255,0.15)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.40)',
          borderRadius: 22,
        }}
      >
        <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.5} />
      </LinearGradient>
    </TouchableOpacity>
  );
}