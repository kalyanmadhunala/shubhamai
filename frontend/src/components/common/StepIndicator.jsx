// src/components/common/StepIndicator.jsx
// 3-step progress indicator used in PosterScreen and CustomPromptResult.
// Props: steps (array of strings), currentStep (1-based index)

import React from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import THEME from '../../constants/theme';

export default function StepIndicator({ steps = [], currentStep = 1 }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        marginVertical: 12,
      }}
    >
      {steps.map((label, index) => {
        const stepNum  = index + 1;
        const isDone   = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        const isLast   = index === steps.length - 1;

        return (
          <View
            key={label}
            style={{ flexDirection: 'row', alignItems: 'center', flex: isLast ? 0 : 1 }}
          >
            {/* Circle */}
            <View style={{ alignItems: 'center' }}>
              {isActive || isDone ? (
                <LinearGradient
                  colors={THEME.gradients.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: 13,
                      fontFamily: 'Inter-Bold',
                    }}
                  >
                    {isDone ? '✓' : stepNum}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: THEME.colors.grey,
                      fontSize: 13,
                      fontFamily: 'Inter-SemiBold',
                    }}
                  >
                    {stepNum}
                  </Text>
                </View>
              )}

              {/* Step label */}
              <Text
                style={{
                  fontSize: 11,
                  fontFamily: isActive ? 'Inter-SemiBold' : 'Inter-Regular',
                  color: isActive ? THEME.colors.primary : THEME.colors.grey,
                  marginTop: 4,
                  textAlign: 'center',
                  maxWidth: 64,
                }}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>

            {/* Connector line */}
            {!isLast && (
              <View
                style={{
                  flex: 1,
                  height: 2.5,
                  marginHorizontal: 4,
                  marginBottom: 16,
                  borderRadius: 2,
                  backgroundColor: isDone
                    ? THEME.colors.primary
                    : 'rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                }}
              >
                {isDone && (
                  <LinearGradient
                    colors={THEME.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}