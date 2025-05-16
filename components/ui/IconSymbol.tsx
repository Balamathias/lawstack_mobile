// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'email',
  'chevron.left.forwardslash.chevron.right': 'arrow-back',
  'chevron.right': 'chevron-right',
  'bubble.left.and.bubble.right.fill': 'visibility',
  'gearshape.fill': 'vpn-key',
  'crown.fill': 'visibility-off',
  'person.fill': 'person',
  'phone.fill': 'phone',
  'textformat.alt': 'text-fields',
  'person.badge.plus.fill': 'person-add',
  'checkmark.rectangle.fill': 'check-box',
  'xmark.rectangle.fill': 'check-box-outline-blank',
  'sparkles': 'auto-awesome',
  'book.fill': 'book',
  'brain': 'psychology',
  'document.text.fill': 'description',
  'bookmark.fill': 'bookmark',
  'magnifyingglass': 'search',
  'calendar': 'calendar-today',
  'graduationcap.fill': 'school',
  'clock.fill': 'access-time',
  'star.fill': 'star',
  'shield.fill': 'shield',

  'search.fill': 'search',
  'message.fill': 'message',
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name] as any} style={style} />;
}
