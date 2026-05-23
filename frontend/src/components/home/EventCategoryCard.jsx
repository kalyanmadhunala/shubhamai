import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, GRADIENTS } from '../../constants/colors';
import { scale, verticalScale, moderateScale } from '../../utils/responsive';

const { width } = Dimensions.get('window');

// Card dimensions — 2 per row with gap
const CARD_GAP = scale(12);
const CARD_WIDTH = (width - scale(32) - CARD_GAP) / 2;
const CARD_HEIGHT = CARD_WIDTH * 0.62;

/**
 * EventCategoryCard — used in HomeScreen Events section.
 *
 * Props:
 *   title      — string   e.g. "All Events"
 *   image      — require() — local asset from src/assets/images/
 *   isActive   — bool     — highlights the selected card
 *   onPress    — fn
 *
 * Usage:
 *   <EventCategoryCard
 *     title="Telangana"
 *     image={require('../../assets/images/telangana_events.png')}
 *     isActive={activeCategory === 'Telangana'}
 *     onPress={() => setActiveCategory('Telangana')}
 *   />
 */
export default function EventCategoryCard({
  title,
  image,
  isActive = false,
  onPress,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{ width: CARD_WIDTH }}
    >
      {/* Outer gradient border when active */}
      <LinearGradient
        colors={isActive ? GRADIENTS.primary : ['transparent', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: moderateScale(18),
          padding: isActive ? 2 : 0,
        }}
      >
        <View
          className="overflow-hidden"
          style={{
            borderRadius: moderateScale(16),
            height: CARD_HEIGHT,
            elevation: isActive ? 8 : 4,
            shadowColor: isActive ? COLORS.primary : '#000',
            shadowOpacity: isActive ? 0.25 : 0.08,
            shadowRadius: isActive ? 12 : 8,
          }}
        >
          {/* Background image */}
          {image ? (
            <Image
              source={image}
              style={{ width: '100%', height: '100%', position: 'absolute' }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: '100%',
                position: 'absolute',
                backgroundColor: COLORS.lightGrey,
              }}
            />
          )}

          {/* Dark overlay */}
          <LinearGradient
            colors={
              isActive
                ? ['rgba(0,188,212,0.35)', 'rgba(13,71,161,0.75)']
                : ['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.55)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Active checkmark badge */}
          {isActive && (
            <View
              className="absolute top-2 right-2 items-center justify-center rounded-full"
              style={{
                width: scale(20),
                height: scale(20),
                backgroundColor: 'rgba(255,255,255,0.9)',
              }}
            >
              <Text style={{ fontSize: scale(11), color: COLORS.primary }}>✓</Text>
            </View>
          )}

          {/* Title */}
          <View
            className="absolute bottom-0 left-0 right-0 px-3 pb-2.5"
          >
            <Text
              className="text-white font-bold"
              style={{ fontSize: moderateScale(13) }}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}