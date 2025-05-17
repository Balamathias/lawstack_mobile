import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useColorScheme } from 'nativewind';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '../../constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { User } from '@/@types/db';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING } from '@/constants/Spacing';

interface Props {
  user: User | null;
}

export const Header: React.FC<Props> = ({ user }) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  // Get user initials for avatar placeholder
  const getUserInitials = () => {
    if (!user) return "G";
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    return "?";
  };
  
  return (
    <Stack.Screen

      options={{
        headerShown: true,
        header: () => (
          <Animated.View 
              entering={FadeInDown.duration(750)}
              style={[
                styles.header, 
                { 
                  paddingTop: insets.top + 10,
                  backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
                }
              ]}
            >
              <View style={styles.logoContainer}>
                {/* <View style={[
                  styles.logoBackground,
                ]}>
                  <MaterialIcons name="balance" size={20} color={isDark ? '#fff' : Colors.light.primary} />
                </View> */}
                <Text style={[
                  styles.logoText,
                  { color: isDark ? Colors.dark.text : Colors.light.text }
                ]}>
                  lawstack
                </Text>
              </View>
              
              <Pressable style={styles.avatarContainer}>
                {user?.avatar ? (
                  <Image 
                    source={{ uri: user.avatar }} 
                    style={styles.avatar} 
                  />
                ) : (
                  <View style={[
                    styles.avatarPlaceholder,
                    { backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary }
                  ]}>
                    <Text style={styles.avatarText}>{getUserInitials()}</Text>
                  </View>
                )}
              </Pressable>
            </Animated.View>
        )
      }}

    />
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBackground: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarContainer: {
    height: 40,
    width: 40,
    overflow: 'hidden',
  },
  avatar: {
    height: 36,
    width: 36,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    height: 36,
    width: 36,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
