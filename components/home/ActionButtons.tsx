import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInDown, useAnimatedStyle } from 'react-native-reanimated';
import { IconSymbol } from '../ui/IconSymbol';
import { Colors } from '../../constants/Colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ActionButtonsProps = {
  buttonScale: Animated.SharedValue<number>;
  handlePressIn: () => void;
  handlePressOut: () => void;
  router: Router;
};

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  buttonScale,
  handlePressIn,
  handlePressOut,
  router,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  
  return (
    <Animated.View 
      style={styles.actionButtons}
      entering={FadeInDown.delay(500).duration(700)}
      className={'web:grid web:grid-cols-2 web:gap-4'}
    >
      {/* Sign In Button */}
      <AnimatedPressable
        style={[
          styles.primaryButton,
          buttonAnimatedStyle,
          { 
            backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
            shadowColor: isDark ? Colors.dark.shadow : Colors.light.shadow 
          }
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push('/login')}
      >
        <View style={styles.buttonContent}>
          <IconSymbol
            name="person.fill"
            size={18}
            color="#FFFFFF"
          />
          <Text style={styles.buttonText}>Sign In</Text>
        </View>
      </AnimatedPressable>
      
      {/* Sign Up Button */}
      <AnimatedPressable
        style={[
          styles.secondaryButton,
          buttonAnimatedStyle,
          { 
            borderColor: isDark ? Colors.dark.primary : Colors.light.primary,
          }
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push('/register')}
      >
        <View style={styles.buttonContent}>
          <IconSymbol
            name="person.badge.plus.fill"
            size={18}
            color={isDark ? Colors.dark.primary : Colors.light.primary}
          />
          <Text style={[
            styles.secondaryButtonText,
            { color: isDark ? Colors.dark.primary : Colors.light.primary }
          ]}>Create Account</Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'column',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
