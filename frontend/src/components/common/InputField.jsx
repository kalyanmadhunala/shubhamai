// src/components/common/InputField.jsx

import React, {
  useState,
  forwardRef,
} from 'react';

import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
} from 'react-native';

import {
  Eye,
  EyeOff,
} from 'lucide-react-native';

import THEME from '../../constants/theme';

const InputField = forwardRef(
  (
    {
      label,
      placeholder,
      value,
      onChangeText,
      secureTextEntry,
      keyboardType,
      error,
      icon,
      hint,
      style,
      multiline = false,
      numberOfLines,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] =
      useState(false);

    const [
      showPassword,
      setShowPassword,
    ] = useState(false);

    const borderColor = error
      ? THEME.colors.error
      : focused
      ? THEME.colors.primary
      : 'rgba(0,0,0,0.10)';

    return (
      <View
        style={[
          { marginBottom: 16 },
          style,
        ]}
      >
        {/* Label */}

        {label && (
          <Text
            style={{
              fontSize: 14,
              fontFamily:
                'Inter-SemiBold',
              color:
                THEME.colors.textPrimary,
              marginBottom: 8,
              marginLeft: 2,
            }}
          >
            {label}
          </Text>
        )}

        {/* Input Row */}

        <View
          style={{
            flexDirection: 'row',

            alignItems: multiline
              ? 'flex-start'
              : 'center',

            backgroundColor: '#FFFFFF',

            borderRadius:
              THEME.radius.lg,

            borderWidth: focused
              ? 2
              : 1.5,

            borderColor,

            minHeight: multiline
              ? 100
              : THEME.size.inputHeight,

            paddingHorizontal: 16,

            paddingVertical: multiline
              ? 12
              : 0,

            gap: 10,

            ...(focused
              ? {
                  shadowColor:
                    THEME.colors.primary,

                  shadowOffset: {
                    width: 0,
                    height: 0,
                  },

                  shadowOpacity: 0.12,

                  shadowRadius: 6,

                  elevation: 2,
                }
              : THEME.shadow.card),
          }}
        >
          {/* Leading Icon */}

          {icon && (
            <View
              style={{
                marginTop: multiline
                  ? 2
                  : 0,
              }}
            >
              {icon}
            </View>
          )}

          {/* Text Input */}

          <TextInput
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={
              THEME.colors.grey
            }
            secureTextEntry={
              secureTextEntry &&
              !showPassword
            }
            keyboardType={
              keyboardType || 'default'
            }
            multiline={multiline}
            numberOfLines={
              numberOfLines
            }
            textAlignVertical={
              multiline
                ? 'top'
                : 'center'
            }
            onFocus={() =>
              setFocused(true)
            }
            onBlur={() =>
              setFocused(false)
            }
            style={{
              flex: 1,

              fontSize: 16,

              fontFamily:
                'Inter-Regular',

              color:
                THEME.colors
                  .textPrimary,

              paddingVertical: 0,
            }}
            {...props}
          />

          {/* Password Toggle */}

          {secureTextEntry && (
            <TouchableOpacity
              onPress={() =>
                setShowPassword(
                  !showPassword,
                )
              }
              activeOpacity={0.7}
              hitSlop={{
                top: 8,
                bottom: 8,
                left: 8,
                right: 8,
              }}
            >
              {showPassword ? (
                <Eye
                  size={20}
                  color={
                    THEME.colors.grey
                  }
                />
              ) : (
                <EyeOff
                  size={20}
                  color={
                    THEME.colors.grey
                  }
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Hint */}

        {hint && !error && (
          <Text
            style={{
              fontSize: 12,

              fontFamily:
                'Inter-Regular',

              color:
                THEME.colors
                  .textSecondary,

              marginTop: 5,

              marginLeft: 2,
            }}
          >
            {hint}
          </Text>
        )}

        {/* Error */}

        {error && (
          <Text
            style={{
              fontSize: 12,

              fontFamily:
                'Inter-Regular',

              color:
                THEME.colors.error,

              marginTop: 5,

              marginLeft: 2,
            }}
          >
            ⚠ {error}
          </Text>
        )}
      </View>
    );
  },
);

export default InputField;