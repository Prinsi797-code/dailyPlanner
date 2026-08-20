import React from 'react';
import { Text, TextProps } from 'react-native';
import { useFont } from '../theme/FontContext';

export default function AppText(props: TextProps) {
  const { fontFamily } = useFont();
  const nativeFont = fontFamily && fontFamily !== 'System' ? fontFamily : undefined;

  return (
    <Text {...props} style={[nativeFont ? { fontFamily: nativeFont } : null, props.style]} />
  );
}