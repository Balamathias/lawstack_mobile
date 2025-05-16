import { Link, Stack } from 'expo-router';
import { StyleSheet, Animated, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors?.[colorScheme ?? 'light'] ?? Colors.light;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <>
      <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Oops!', headerShown: false }} />
        <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
          <MaterialIcons name="error-outline" size={120} color={colors.error} />
        </Animated.View>
        
        <ThemedView style={styles.textContainer}>
          <ThemedText style={styles.title}>Page Not Found</ThemedText>
          <ThemedText style={styles.subtitle}>
            The screen you're looking for doesn't exist.
          </ThemedText>
        </ThemedView>
        
        <Link href="/" asChild>
          <Pressable style={[styles.button, { backgroundColor: colors.primary }]} className='flex flex-row items-center justify-center'>
            <MaterialIcons name="home" size={24} color="#fff" />
            <ThemedText style={styles.buttonText}>Go to Home</ThemedText>
          </Pressable>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  textContainer: {
    marginVertical: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  }
});
