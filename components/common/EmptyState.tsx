import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay
} from 'react-native-reanimated';

type EmptyStateProps = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  color?: string;
};

const EmptyState = ({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  color
}: EmptyStateProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  // Animation values
  const scale = useSharedValue(0.8);
  const buttonScale = useSharedValue(1);
  
  useEffect(() => {
    scale.value = withDelay(
      300, 
      withSpring(1, { damping: 12, stiffness: 100 })
    );
  }, []);
  
  // Animation styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));
  
  // Button press handlers
  const handlePressIn = () => {
    if (!onAction) return;
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
  };
  
  const handlePressOut = () => {
    if (!onAction) return;
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };
  
  const themeColor = color || colors.primary;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <View style={[styles.iconContainer, { backgroundColor: `${themeColor}15` }]}>
        <MaterialIcons name={icon} size={40} color={themeColor} />
      </View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.message, { color: colors.secondaryText }]}>
        {message}
      </Text>
      
      {actionLabel && onAction && (
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: themeColor }]}
            onPress={onAction}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Text style={styles.buttonText}>{actionLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: SPACING.md,
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmptyState;
