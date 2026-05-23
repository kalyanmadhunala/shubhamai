// src/components/common/SecondaryButton.jsx
// REDESIGNED — now wraps GradientButton in outline mode.
// All original props preserved: title, onPress, disabled, style

import React from 'react';
import GradientButton from './GradientButton';

export default function SecondaryButton({ title, onPress, disabled, style }) {
  return (
    <GradientButton
      title={title}
      onPress={onPress}
      disabled={disabled}
      style={style}
      outline
    />
  );
}