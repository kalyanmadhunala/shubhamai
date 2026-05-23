// src/components/common/AppToast.jsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle, XCircle, Info } from 'lucide-react-native';
import { moderateScale, scale } from '../../utils/responsive';

const CONFIG = {
  success: {
    icon: <CheckCircle size={18} color="#10B981" strokeWidth={2.5} />,
    accent: '#10B981',
    bg: '#F0FDF4',
  },
  error: {
    icon: <XCircle size={18} color="#EF4444" strokeWidth={2.5} />,
    accent: '#EF4444',
    bg: '#FEF2F2',
  },
  info: {
    icon: <Info size={18} color="#3B82F6" strokeWidth={2.5} />,
    accent: '#3B82F6',
    bg: '#EFF6FF',
  },
};

function PremiumToast({ type = 'success', text1, text2 }) {
  const { icon, accent, bg } = CONFIG[type] ?? CONFIG.info;

  return (
    <View
      style={{
        marginHorizontal: scale(16),
        borderRadius: scale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 10,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: scale(16),
          paddingHorizontal: scale(14),
          paddingVertical: scale(12),
          gap: scale(12),
          borderWidth: 1,
          borderColor: 'rgba(0,0,0,0.06)',
          borderLeftWidth: 4,
          borderLeftColor: accent,
        }}
      >
        {/* Icon bubble */}
        <View
          style={{
            width: scale(36),
            height: scale(36),
            borderRadius: scale(10),
            backgroundColor: bg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </View>

        {/* Text — use StyleSheet.flatten to bypass monkey-patch conflict */}
        <View style={{ flex: 1, gap: 2 }}>
          {!!text1 && (
            <Text
              numberOfLines={1}
              style={StyleSheet.flatten([
                {
                  fontSize: moderateScale(14),
                  fontFamily: 'Inter-Bold',
                  color: '#111827', // ← explicit, not inherited
                  includeFontPadding: false,
                },
              ])}
            >
              {String(text1)}
            </Text>
          )}
          {!!text2 && (
            <Text
              numberOfLines={2}
              style={StyleSheet.flatten([
                {
                  fontSize: moderateScale(12),
                  fontFamily: 'Inter-Regular',
                  color: '#6B7280', // ← explicit
                  lineHeight: moderateScale(17),
                  includeFontPadding: false,
                },
              ])}
            >
              {String(text2)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export const toastConfig = {
  success: ({ text1, text2 }) => (
    <PremiumToast type="success" text1={text1} text2={text2} />
  ),
  error: ({ text1, text2 }) => (
    <PremiumToast type="error" text1={text1} text2={text2} />
  ),
  info: ({ text1, text2 }) => (
    <PremiumToast type="info" text1={text1} text2={text2} />
  ),
};
