// src/screens/main/CustomPosterGenerationScreen.jsx

import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import {
  ChevronRight,
  Sparkles,
  CalendarDays,
  CalendarClock,
  CalendarX,
  User,
  Building2,
  CircleUserRound,
  Info,
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, GRADIENTS } from '../../constants/colors';

import { scale, verticalScale, moderateScale } from '../../utils/responsive';

import BackButton from '../../components/common/BackButton';

import { ROUTES } from '../../navigation/routes';

import { PROFILE_KEY } from './HomeScreen';
import { toast, Toaster } from 'sonner-native';

// ─────────────────────────────────────────────
// Occasion Chips
// ─────────────────────────────────────────────

const OCCASION_CHIPS = [
  { label: 'Happy Birthday', emoji: '🎂' },
  { label: 'Happy Wedding Anniversary', emoji: '🎊' },
  { label: 'Congratulations', emoji: '⭐' },
  { label: 'Best Wishes', emoji: '🎉' },
];

// ─────────────────────────────────────────────
// Step Indicator
// ─────────────────────────────────────────────

function StepIndicator({ currentStep = 1 }) {
  const steps = [
    { num: 1, label: 'Details' },
    { num: 2, label: 'AI App' },
    { num: 3, label: 'Get Poster' },
  ];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(14),
      }}
    >
      {steps.map((step, i) => {
        const isActive = step.num === currentStep;
        const isDone = step.num < currentStep;

        return (
          <React.Fragment key={step.num}>
            <View
              style={{
                alignItems: 'center',
                gap: scale(4),
              }}
            >
              {isActive ? (
                <LinearGradient
                  colors={GRADIENTS.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: scale(28),
                    height: scale(28),
                    borderRadius: scale(14),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: moderateScale(12),
                      fontFamily: 'Inter-Bold',
                    }}
                  >
                    {step.num}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={{
                    width: scale(28),
                    height: scale(28),
                    borderRadius: scale(14),
                    backgroundColor: isDone ? COLORS.primary : '#E8E8E8',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: isDone ? '#fff' : '#AAAAAA',
                      fontSize: moderateScale(12),
                      fontFamily: 'Inter-Bold',
                    }}
                  >
                    {step.num}
                  </Text>
                </View>
              )}

              <Text
                style={{
                  fontSize: moderateScale(9),
                  fontFamily: 'Inter-SemiBold',
                  color: isActive ? COLORS.primary : '#AAAAAA',
                }}
              >
                {step.label}
              </Text>
            </View>

            {i < steps.length - 1 && (
              <View
                style={{
                  flex: 1,
                  height: 1.5,
                  backgroundColor: '#E0E0E0',
                  marginBottom: scale(14),
                  marginHorizontal: scale(4),
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────

export default function CustomPosterGenerationScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [personName, setPersonName] = useState('');

  const [selectedChip, setSelectedChip] = useState('Happy Birthday');

  const [description, setDescription] = useState('🎂 Happy Birthday');

  const [businessName, setBusinessName] = useState('');

  const [wisherName, setWisherName] = useState('');

  const [errors, setErrors] = useState({});

  // ─────────────────────────────────────────
  // Load Profile
  // ─────────────────────────────────────────

  useEffect(() => {
    AsyncStorage.getItem(PROFILE_KEY)
      .then(raw => {
        if (raw) {
          const p = JSON.parse(raw);

          if (p.businessName) {
            setBusinessName(p.businessName);
          }

          if (p.fullName) {
            setWisherName(p.fullName);
          }
        }
      })
      .catch(() => {});
  }, []);

  // ─────────────────────────────────────────
  // Continue
  // ─────────────────────────────────────────

  const handleContinue = () => {
    if (!personName.trim() || !description.trim()) {
      toast.error('Enter the required fields');
      return;
    }

    if (!personName.trim()) {
      toast.error('Person name is required');
      return;
    }

    if (!description.trim()) {
      toast.error('Occasion / description is required');
      return;
    }

    navigation.navigate(ROUTES.POSTER, {
      isCustom: true,

      customParams: {
        personName: personName.trim(),

        description: description.trim(),

        businessName: businessName.trim(),

        wisherName: wisherName.trim(),
      },
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
      }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      {/* Toaster */}

      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          elevation: 9999,
          pointerEvents: 'box-none',
        }}
      >
        <Toaster
          position="bottom-center"
          richColors
          offset={insets.top + 12}
          visibleToastCount={2}
          toastOptions={{
            style: {
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: 'rgba(0,0,0,0.06)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 9999,
            },
            titleStyle: {
              fontFamily: 'Inter-Bold',
              fontSize: 14,
              color: '#111827',
            },
            descriptionStyle: {
              fontFamily: 'Inter-Regular',
              fontSize: 12,
              color: '#6B7280',
              lineHeight: 17,
            },
            successStyle: {
              borderLeftWidth: 4,
              borderLeftColor: '#10B981',
            },
            errorStyle: {
              borderLeftWidth: 4,
              borderLeftColor: '#EF4444',
            },
            infoStyle: {
              borderLeftWidth: 4,
              borderLeftColor: '#3B82F6',
            },
          }}
        />
      </View>

      {/* Header */}

      <View
        style={{
          backgroundColor: '#FFFFFF',
          paddingTop: verticalScale(52),
        }}
      >
        {/* Top Row */}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: scale(16),
            paddingBottom: verticalScale(4),
          }}
        >
          <BackButton onPress={() => navigation.goBack()} />

          <View
            style={{
              flex: 1,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(16),
                fontFamily: 'Inter-Bold',
                color: '#1A1A2E',
              }}
            >
              Custom Poster Prompt
            </Text>

            <Text
              style={{
                fontSize: moderateScale(11),
                color: '#999',
                fontFamily: 'Inter-Regular',
                marginTop: 2,
              }}
            >
              Step 1 of 3
            </Text>
          </View>

          <View style={{ width: scale(32) }} />
        </View>

        {/* Stepper */}

        <StepIndicator currentStep={1} />
      </View>

      {/* Form */}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            padding: scale(16),
            paddingBottom: verticalScale(100),
          }}
        >
          {/* Person Details */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: moderateScale(16),
              padding: scale(16),
              marginBottom: scale(12),
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(13),
                fontFamily: 'Inter-Bold',
                color: '#1A1A2E',
                marginBottom: scale(10),
              }}
            >
              Person Details
            </Text>

            <Text
              style={{
                fontSize: moderateScale(11),
                fontFamily: 'Inter-SemiBold',
                color: '#555',
                marginBottom: scale(6),
              }}
            >
              Person Name <Text style={{ color: 'red' }}>*</Text>
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: errors.personName ? '#FF4444' : '#E8E8E8',
                borderRadius: moderateScale(10),
                paddingHorizontal: scale(12),
                paddingVertical: scale(11),
                backgroundColor: '#FAFAFA',
                gap: scale(8),
              }}
            >
              <User size={18} color="#0D47A1" />

              <TextInput
                value={personName}
                onChangeText={t => {
                  setPersonName(t);

                  setErrors(p => ({
                    ...p,
                    personName: '',
                  }));
                }}
                placeholder="Dandi Harish Kumar"
                placeholderTextColor="#BBBBBB"
                style={{
                  flex: 1,
                  fontSize: moderateScale(13),
                  fontFamily: 'Inter-Regular',
                  color: '#1A1A2E',
                  padding: 0,
                }}
              />
            </View>

            {errors.personName ? (
              <Text
                style={{
                  color: '#FF4444',
                  fontSize: moderateScale(10),
                  marginTop: 4,
                }}
              >
                {errors.personName}
              </Text>
            ) : null}
          </View>
          {/* Occasion */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: moderateScale(16),
              padding: scale(16),
              marginBottom: scale(12),
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(13),
                fontFamily: 'Inter-Bold',
                color: '#1A1A2E',
                marginBottom: scale(12),
              }}
            >
              Occasion <Text style={{ color: 'red' }}>*</Text>
            </Text>

            {/* Chips */}

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: scale(8),
                marginBottom: scale(14),
              }}
            >
              {OCCASION_CHIPS.map(chip => {
                const isSelected = selectedChip === chip.label;

                return isSelected ? (
                  <TouchableOpacity
                    key={chip.label}
                    onPress={() => {
                      setSelectedChip(chip.label);

                      setDescription(`${chip.emoji} ${chip.label}`);
                    }}
                    activeOpacity={0.85}
                    style={{
                      borderRadius: moderateScale(20),
                      overflow: 'hidden',
                    }}
                  >
                    <LinearGradient
                      colors={GRADIENTS.primary}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: scale(12),
                        paddingVertical: scale(7),
                        gap: scale(5),
                      }}
                    >
                      <Text
                        style={{
                          fontSize: scale(13),
                        }}
                      >
                        {chip.emoji}
                      </Text>

                      <Text
                        style={{
                          color: '#fff',
                          fontSize: moderateScale(12),
                          fontFamily: 'Inter-SemiBold',
                        }}
                      >
                        {chip.label}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    key={chip.label}
                    onPress={() => {
                      setSelectedChip(chip.label);

                      setDescription(`${chip.emoji} ${chip.label}`);

                      setErrors(p => ({
                        ...p,
                        description: '',
                      }));
                    }}
                    activeOpacity={0.8}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: scale(12),
                      paddingVertical: scale(7),
                      borderRadius: moderateScale(20),
                      borderWidth: 1,
                      borderColor: '#E0E0E0',
                      backgroundColor: '#FAFAFA',
                      gap: scale(5),
                    }}
                  >
                    <Text
                      style={{
                        fontSize: scale(13),
                      }}
                    >
                      {chip.emoji}
                    </Text>

                    <Text
                      style={{
                        fontSize: moderateScale(12),
                        fontFamily: 'Inter-SemiBold',
                        color: '#666',
                      }}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description */}

            <Text
              style={{
                fontSize: moderateScale(11),
                fontFamily: 'Inter-SemiBold',
                color: '#555',
                marginBottom: scale(6),
              }}
            >
              Description / Occasion <Text style={{ color: 'red' }}>*</Text>
            </Text>

            <View
              style={{
                borderWidth: 1,
                borderColor: errors.description ? '#FF4444' : '#E8E8E8',
                borderRadius: moderateScale(10),
                paddingHorizontal: scale(12),
                paddingVertical: scale(10),
                backgroundColor: '#FAFAFA',
              }}
            >
              <TextInput
                value={description}
                onChangeText={t => {
                  setDescription(t);

                  setErrors(p => ({
                    ...p,
                    description: '',
                  }));
                }}
                placeholder="Happy Birthday! Wishing you happiness and success."
                placeholderTextColor="#BBBBBB"
                multiline
                numberOfLines={3}
                style={{
                  fontSize: moderateScale(13),
                  fontFamily: 'Inter-Regular',
                  color: '#1A1A2E',
                  minHeight: verticalScale(60),
                  textAlignVertical: 'top',
                  padding: 0,
                }}
              />
            </View>

            {errors.description ? (
              <Text
                style={{
                  color: '#FF4444',
                  fontSize: moderateScale(10),
                  marginTop: 4,
                }}
              >
                {errors.description}
              </Text>
            ) : null}
          </View>
          {/* Business Details */}
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: moderateScale(16),
              padding: scale(16),
              marginBottom: scale(12),
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 1,
              },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <Text
              style={{
                fontSize: moderateScale(13),
                fontFamily: 'Inter-Bold',
                color: '#1A1A2E',
                marginBottom: scale(12),
              }}
            >
              Your Details
            </Text>

            {/* Business Name */}

            <Text
              style={{
                fontSize: moderateScale(11),
                fontFamily: 'Inter-SemiBold',
                color: '#555',
                marginBottom: scale(6),
              }}
            >
              Business Name
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E8E8E8',
                borderRadius: moderateScale(10),
                paddingHorizontal: scale(12),
                paddingVertical: scale(11),
                backgroundColor: '#FAFAFA',
                gap: scale(8),
                marginBottom: scale(12),
              }}
            >
              <Building2 size={18} color="#0D47A1" />
              <TextInput
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Business Name"
                placeholderTextColor="#BBBBBB"
                style={{
                  flex: 1,
                  fontSize: moderateScale(13),
                  fontFamily: 'Inter-Regular',
                  color: '#1A1A2E',
                  padding: 0,
                }}
              />
            </View>

            {/* Wisher Name */}

            <Text
              style={{
                fontSize: moderateScale(11),
                fontFamily: 'Inter-SemiBold',
                color: '#555',
                marginBottom: scale(6),
              }}
            >
              Wisher Name
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: '#E8E8E8',
                borderRadius: moderateScale(10),
                paddingHorizontal: scale(12),
                paddingVertical: scale(11),
                backgroundColor: '#FAFAFA',
                gap: scale(8),
              }}
            >
              <CircleUserRound size={18} color="#0D47A1" />
              <TextInput
                value={wisherName}
                onChangeText={setWisherName}
                placeholder="Wisher Name"
                placeholderTextColor="#BBBBBB"
                style={{
                  flex: 1,
                  fontSize: moderateScale(13),
                  fontFamily: 'Inter-Regular',
                  color: '#1A1A2E',
                  padding: 0,
                }}
              />
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              paddingHorizontal: scale(16),
              paddingBottom: verticalScale(32),
              paddingTop: verticalScale(12),
            }}
          >
            <TouchableOpacity onPress={handleContinue} activeOpacity={0.87}>
              <LinearGradient
                colors={GRADIENTS.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: moderateScale(16),
                  paddingVertical: verticalScale(16),
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: scale(8),
                }}
              >
                <Text
                  style={{
                    color: '#fff',
                    fontSize: moderateScale(15),
                    fontFamily: 'Inter-Bold',
                  }}
                >
                  Continue
                </Text>

                <Text
                  style={{
                    color: '#fff',
                    fontSize: moderateScale(16),
                  }}
                >
                  →
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
