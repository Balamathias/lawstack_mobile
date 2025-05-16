import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions, AccessibilityInfo } from 'react-native';
import { useColorScheme } from 'nativewind';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay,
  useSharedValue 
} from 'react-native-reanimated';
import { IconSymbol } from '../ui/IconSymbol';
import { Colors } from '../../constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type QuickActionItemProps = {
  icon: string;
  label: string;
  onPress?: () => void;
  testID?: string;
  accentColor?: string;
};

type QuickActionsProps = {
  actions?: QuickActionItemProps[];
  onActionPress?: (index: number) => void;
};

const QuickActionButton: React.FC<QuickActionItemProps & { isDark: boolean }> = ({
  icon,
  label,
  onPress,
  testID,
  accentColor,
  isDark,
}) => {
  const buttonScale = useSharedValue(1);
  const iconRotate = useSharedValue(0);

  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    iconRotate.value = withSequence(
      withSpring(-0.05, { damping: 20, stiffness: 300 }),
      withSpring(0, { damping: 20, stiffness: 300 })
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotate.value * 30}deg` }],
  }));
  
  const effectiveAccentColor = accentColor || (isDark ? Colors.dark.primary : Colors.light.primary);
  const accentBgColor = accentColor ? 
    `${accentColor}20` : 
    (isDark ? Colors.dark.primaryLight : Colors.light.primaryLight);

  return (
    <AnimatedPressable
      style={[
        styles.quickActionButton,
        buttonAnimatedStyle,
        { 
          backgroundColor: isDark ? Colors.dark.secondaryBackground : Colors.light.secondaryBackground,
          borderColor: isDark ? Colors.dark.border : Colors.light.border,
        }
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      testID={testID}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View style={styles.quickActionContent}>
        <Animated.View style={[
          styles.quickActionIcon,
          iconAnimatedStyle,
          // { backgroundColor: accentBgColor }
        ]}>
          <IconSymbol
            name={icon as any}
            size={20}
            color={effectiveAccentColor}
          />
        </Animated.View>
        <View style={styles.textContainer}>
          <Text style={[
            styles.quickActionText,
            { color: isDark ? Colors.dark.text : Colors.light.text }
          ]} numberOfLines={1} ellipsizeMode="tail">
            {label}
          </Text>
        </View>
        <IconSymbol
          name="chevron.right"
          size={16}
          color={isDark ? Colors.dark.secondaryText : Colors.light.secondaryText}
          style={styles.chevron}
        />
      </View>
    </AnimatedPressable>
  );
};

export const QuickActions: React.FC<QuickActionsProps> = ({ 
  actions = [
    { icon: "book.fill", label: "Continue Learning" },
    { icon: "sparkles", label: "AI Assistant", accentColor: "#6366F1" }
  ],
  onActionPress
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const containerStyle = {
    marginBottom: insets.bottom > 0 ? 0 : 16
  };

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility('Quick actions available');
  }, []);

  return (
    <Animated.View 
      style={[styles.quickActions, containerStyle]}
      entering={FadeInDown.delay(300).springify().damping(15)}
      testID="quick-actions-container"
    >
      {actions.map((action, index) => (
        <QuickActionButton
          key={`action-${index}`}
          icon={action.icon}
          label={action.label}
          isDark={isDark}
          accentColor={action.accentColor}
          testID={`quick-action-${index}`}
          onPress={() => onActionPress?.(index)}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  quickActions: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  quickActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionIcon: {
    borderRadius: 10,
    padding: 8,
  },
  textContainer: {
    flex: 1,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  chevron: {
    opacity: 0.5,
    marginLeft: 'auto',
  }
});
