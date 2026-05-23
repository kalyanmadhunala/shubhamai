import React from 'react';
import { Text, View } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { GRADIENTS } from '../../constants/colors';

/**
 * GradientText — renders text with a primary gradient fill.
 *
 * Usage:
 *   <GradientText style={{ fontSize: 24, fontWeight: 'bold' }}>
 *     ShubhaMAI
 *   </GradientText>
 *
 * NOTE: Requires @react-native-masked-view/masked-view
 *   npm install @react-native-masked-view/masked-view
 *
 * Fallback: If MaskedView is unavailable it renders with primary color.
 */
export default function GradientText({
  children,
  style,
  colors = GRADIENTS.primary,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
  numberOfLines,
  ...props
}) {
  try {
    return (
      <MaskedView
        maskElement={
          <Text
            style={[style, { backgroundColor: 'transparent' }]}
            numberOfLines={numberOfLines}
            {...props}
          >
            {children}
          </Text>
        }
      >
        <LinearGradient colors={colors} start={start} end={end}>
          <Text
            style={[style, { opacity: 0 }]}
            numberOfLines={numberOfLines}
            {...props}
          >
            {children}
          </Text>
        </LinearGradient>
      </MaskedView>
    );
  } catch {
    // Fallback if MaskedView not installed yet
    return (
      <Text
        style={[style, { color: colors[0] }]}
        numberOfLines={numberOfLines}
        {...props}
      >
        {children}
      </Text>
    );
  }
}