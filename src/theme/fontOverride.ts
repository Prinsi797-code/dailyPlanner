import { setCustomText, setCustomTextInput } from 'react-native-global-props';

export function applyGlobalFont(fontFamily: string | undefined) {
  const customStyle =
    fontFamily && fontFamily !== 'System' ? { fontFamily } : {};

  setCustomText({ style: customStyle });
  setCustomTextInput({ style: customStyle });
}