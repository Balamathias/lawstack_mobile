import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Colors } from '../../constants/Colors';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SharedValue } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING } from '@/constants/Spacing';
import { User } from '@/@types/db';

interface WelcomeSectionProps {
  currentUser: User;
  introTextY: SharedValue<number>;
  buttonScale: SharedValue<number>;
  handlePressIn: () => void;
  handlePressOut: () => void;
}

export function WelcomeSection({
  currentUser,
  introTextY,
  buttonScale,
  handlePressIn,
  handlePressOut,
}: WelcomeSectionProps) {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  const introTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: introTextY.value }],
      opacity: 1 - introTextY.value / 20,
    };
  });

  const buttonAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const userName = currentUser?.first_name || currentUser?.username || 'User';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.textContainer, introTextStyle]}>
          <Text style={[styles.greeting, { color: colors.secondaryText }]}>
            {new Date().getHours() < 12
              ? 'Good morning'
              : new Date().getHours() < 17
              ? 'Good afternoon'
              : 'Good evening'},
          </Text>
          
          <Text style={[styles.userName, { color: colors.text }]}>
            {userName}
          </Text>
          
          <Text style={[styles.description, { color: colors.secondaryText }]}>
            Your AI legal assistant is ready to help with research, exam prep and more.
          </Text>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, buttonAnimStyle]}>
          <TouchableOpacity
            onPress={() => router.push('/chat')}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.button, { overflow: 'hidden' }]}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <MaterialIcons name="chat" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Start Conversation</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.cardContainer}>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <MaterialIcons name="assignment" size={24} color={colors.primary} />
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Study Plans</Text>
            <Text style={[styles.cardDescription, { color: colors.secondaryText }]}>
              Create and manage your study schedule
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.secondaryText} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: SPACING.xl,
  },
  content: {
    marginBottom: SPACING.xxl,
  },
  textContainer: {
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: SPACING.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 27,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: SPACING.sm,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    marginTop: SPACING.md,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: 14,
  },
});
