// src/components/common/SearchBar.jsx
// Reusable search input with icon, clear button, and focus state.
// Props: value, onChangeText, placeholder, onClear, autoFocus, style

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import THEME from '../../constants/theme';

export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  autoFocus = false,
  style,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          borderRadius: THEME.radius.full,
          height: THEME.size.searchHeight,
          paddingHorizontal: 18,
          borderWidth: focused ? 2 : 1.5,
          borderColor: focused
            ? THEME.colors.primary
            : 'rgba(0,0,0,0.08)',
          ...THEME.shadow.card,
          gap: 10,
        },
        style,
      ]}
    >
      <Search
        size={20}
        color={focused ? THEME.colors.primary : THEME.colors.grey}
        strokeWidth={2}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={THEME.colors.grey}
        autoFocus={autoFocus}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          fontSize: 16,
          fontFamily: 'Inter-Regular',
          color: THEME.colors.textPrimary,
          paddingVertical: 0,
        }}
        returnKeyType="search"
        {...props}
      />
      {value?.length > 0 && (
        <TouchableOpacity onPress={handleClear} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: THEME.colors.lightGrey,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={13} color={THEME.colors.grey} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}