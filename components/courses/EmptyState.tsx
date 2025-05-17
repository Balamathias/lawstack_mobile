import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring
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
  
  // Button animation
  const buttonScale = useSharedValue(1);
  
  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }]
  }));
  
  React.useEffect(() => {
    // Simple scale up animation on mount
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);
  
  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  const handlePressIn = () => {
    if (onAction) {
      buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    }
  };
  
  const handlePressOut = () => {
    if (onAction) {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  const iconColor = color || colors.primary;
  const lightColor = `${iconColor}20`;

  return (
    <Animated.View 
      style={styles.container}
      entering={FadeIn.duration(400)}
    >
      <Animated.View 
        style={[
          styles.iconContainer, 
          { backgroundColor: lightColor },
          iconContainerStyle
        ]}
      >
        <MaterialIcons name={icon} size={40} color={iconColor} />
      </Animated.View>
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.message, { color: colors.secondaryText }]}>
        {message}
      </Text>
      
      {actionLabel && onAction && (
        <Animated.View style={[styles.actionContainer, buttonStyle]}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: iconColor }]}
            onPress={onAction}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.8}
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionContainer: {
    marginTop: SPACING.xl,
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  }
});

export default EmptyState;
