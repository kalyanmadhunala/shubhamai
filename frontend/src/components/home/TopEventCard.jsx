import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

const { width } = Dimensions.get('window');

/**
 * TopEventCard — horizontal clickable bar card used in the
 * "Top Events" section of HomeScreen.
 *
 * Props:
 *   event = {
 *     id, name, category, date, emoji, description
 *   }
 *   onPress — fn(event)
 *   index   — number (used for slight stagger styling)
 *
 * Usage:
 *   <TopEventCard event={item} onPress={handleEventPress} index={index} />
 */
export default function TopEventCard({ event, onPress, index = 0 }) {
  // Alternate accent colors for visual variety
  const accentColors = [
    ['#00BCD4', '#0D47A1'],
    ['#7C3AED', '#2563EB'],
    ['#059669', '#0D47A1'],
    ['#DC2626', '#7C3AED'],
    ['#D97706', '#059669'],
  ];
  const accent = accentColors[index % accentColors.length];

  return (
    <TouchableOpacity
      onPress={() => onPress(event)}
      activeOpacity={0.85}
      className="mb-3"
    >
      <View
        className="flex-row items-center bg-white rounded-2xl overflow-hidden"
        style={{
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.07,
          shadowRadius: 8,
        }}
      >
        {/* Left accent strip */}
        <LinearGradient
          colors={accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ width: scale(5), alignSelf: 'stretch' }}
        />

        {/* Emoji circle */}
        <View
          className="items-center justify-center ml-3 rounded-full"
          style={{
            width: scale(46),
            height: scale(46),
            backgroundColor: accent[0] + '18',
          }}
        >
          <Text style={{ fontSize: scale(22) }}>{event?.emoji || '🎉'}</Text>
        </View>

        {/* Event info */}
        <View className="flex-1 ml-3 py-3 pr-2">
          <Text
            className="font-bold"
            style={{ color: COLORS.darkGrey, fontSize: moderateScale(14) }}
            numberOfLines={1}
          >
            {event?.name || 'Event'}
          </Text>
          {event?.description ? (
            <Text
              style={{ color: COLORS.grey, fontSize: moderateScale(11), marginTop: 2 }}
              numberOfLines={1}
            >
              {event.description}
            </Text>
          ) : null}
          {/* Date + category row */}
          <View className="flex-row items-center mt-1" style={{ gap: scale(8) }}>
            <View
              className="flex-row items-center rounded-full px-2 py-0.5"
              style={{ backgroundColor: accent[0] + '15' }}
            >
              <Text style={{ fontSize: scale(10) }}>📅</Text>
              <Text
                className="ml-1 font-semibold"
                style={{ color: accent[0], fontSize: moderateScale(10) }}
              >
                {event?.date || ''}
              </Text>
            </View>
            {event?.category && (
              <Text
                style={{ color: COLORS.grey, fontSize: moderateScale(10) }}
              >
                {event.category}
              </Text>
            )}
          </View>
        </View>

        {/* Right arrow — gradient circle */}
        <View className="mr-3">
          <LinearGradient
            colors={accent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: scale(30),
              height: scale(30),
              borderRadius: scale(15),
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              className="text-white font-bold"
              style={{ fontSize: moderateScale(14) }}
            >
              →
            </Text>
          </LinearGradient>
        </View>
      </View>
    </TouchableOpacity>
  );
}