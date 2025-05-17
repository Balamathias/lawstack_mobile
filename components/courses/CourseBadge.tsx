import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';

type BadgeProps = {
  type: 'level' | 'duration' | 'institution';
  value: string | number;
  icon: keyof typeof MaterialIcons.glyphMap;
  color?: string;
};

const CourseBadge = ({ type, value, icon, color }: BadgeProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  // Get badge styling based on type
  const getBadgeStyle = () => {
    const defaultColor = color || colors.primary;
    
    switch (type) {
      case 'level': {
        return {
          bg: isDark ? `${defaultColor}20` : `${defaultColor}10`,
          text: defaultColor,
        };
      }
      case 'duration':
        return {
          bg: isDark ? '#0369A120' : '#E0F2FE',
          text: isDark ? '#7DD3FC' : '#0369A1',
        };
      default:
        return {
          bg: isDark ? '#71717A20' : '#F4F4F5',
          text: isDark ? '#D4D4D8' : '#3F3F46',
        };
    }
  };

  const badgeStyle = getBadgeStyle();
  
  // Format badge text
  const getBadgeText = () => {
    if (type === 'level') {
      const levelNum = typeof value === 'string' ? 
        parseInt(value.toString().replace(/\D/g, ''), 10) : value;
      return `${levelNum}L`;
    }
    return value.toString();
  };

  return (
    <View 
      style={[
        styles.badge, 
        { 
          backgroundColor: badgeStyle.bg,
        }
      ]}
    >
      <MaterialIcons name={icon} size={12} color={badgeStyle.text} />
      <Text 
        style={[styles.badgeText, { color: badgeStyle.text }]} 
        numberOfLines={1}
      >
        {getBadgeText()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
    marginLeft: 2,
    maxWidth: 60,
  }
});

export default CourseBadge;
