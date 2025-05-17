import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import Animated, { FadeIn } from 'react-native-reanimated';

type MetadataBadgeProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  colors: string[];
};

const MetadataBadge = ({ icon, label, colors }: MetadataBadgeProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <Animated.View 
      entering={FadeIn.duration(300)}
      style={[
        styles.badge, 
        { 
          backgroundColor: isDark ? `${colors[0]}15` : `${colors[0]}10`,
          borderColor: `${colors[0]}30`
        }
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${colors[0]}25` }]}>
        <MaterialIcons name={icon} size={14} color={colors[0]} />
      </View>
      <Text 
        style={[
          styles.label, 
          { color: isDark ? colors[0] : (colors[1] || colors[0] || '#000') }
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
    marginRight: 6,
    flexWrap: 'wrap',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  }
});

export default MetadataBadge;
