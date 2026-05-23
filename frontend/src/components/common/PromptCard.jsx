// src/components/common/PromptCard.jsx
// Displays the generated AI poster prompt text.
// Props: prompt (string), copied (bool), onCopy

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Copy, Check } from 'lucide-react-native';
import GlassCard from './GlassCard';
import THEME from '../../constants/theme';

export default function PromptCard({ prompt = '', copied = false, onCopy }) {
  return (
    <LinearGradient
      colors={['rgba(0,188,212,0.08)', 'rgba(13,71,161,0.05)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: THEME.radius.xl,
        borderWidth: 1.5,
        borderColor: 'rgba(0,188,212,0.18)',
        overflow: 'hidden',
        marginBottom: 20,
      }}
    >
      {/* Card header row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(0,188,212,0.12)',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 16 }}>📋</Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: 'Inter-Bold',
              color: THEME.colors.textPrimary,
            }}
          >
            AI Poster Prompt
          </Text>
        </View>

        {/* Copy button */}
        <TouchableOpacity onPress={onCopy} activeOpacity={0.8}>
          <LinearGradient
            colors={copied ? ['#10B981', '#059669'] : THEME.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
              paddingHorizontal: 14,
              paddingVertical: 7,
              borderRadius: THEME.radius.full,
            }}
          >
            {copied
              ? <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
              : <Copy size={14} color="#FFFFFF" strokeWidth={2} />
            }
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 13,
                fontFamily: 'Inter-SemiBold',
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Prompt text — selectable */}
      <View style={{ padding: 16, maxHeight: 280 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          <Text
            selectable
            style={{
              fontSize: 13.5,
              fontFamily: 'Inter-Regular',
              color: THEME.colors.textPrimary,
              lineHeight: 22,
            }}
          >
            {prompt}
          </Text>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}