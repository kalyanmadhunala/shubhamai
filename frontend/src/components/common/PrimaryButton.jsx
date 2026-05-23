// src/components/common/PrimaryButton.jsx
// REDESIGNED — now wraps GradientButton.
// All original props preserved: title, onPress, loading, disabled, style

import React from 'react';
import GradientButton from './GradientButton';

export default function PrimaryButton({ title, onPress, loading, disabled, style }) {
  return (
    <GradientButton
      title={title}
      onPress={onPress}
      loading={loading}
      disabled={disabled}
      style={style}
    />
  );
}