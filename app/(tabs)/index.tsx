import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../constants/Colors';
import { useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Header } from '../../components/home/Header';
import { WelcomeSection } from '@/components/home/WelcomeSection';
import Features from '@/components/home/Features';
import { useUser } from '@/services/hooks/auth';
import { SPACING } from '@/constants/Spacing';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { MaterialIcons } from '@expo/vector-icons';
import { User } from '@/@types/db';
import { RefreshControl } from 'react-native';
import Loader from '@/components/Loader';


const mockUser: User | null = null;

const { height } = Dimensions.get('window');
const isSmallScreen = height < 700;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { data: user, isPending, refetch } = useUser();
  const colors = Colors[isDark ? 'dark' : 'light'];
  const currentUser = user?.data;

  const introTextY = useSharedValue(20);
  const buttonScale = useSharedValue(1);
  const featureIconRotate = useSharedValue(0);
  const accentOpacity = useSharedValue(0.5);
  const wavesY = useSharedValue(0);

  useEffect(() => {
    introTextY.value = withTiming(0, { duration: 800 });

    accentOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.4, { duration: 2000 })
      ),
      -1,
      true
    );

    wavesY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2500 }),
        withTiming(0, { duration: 2500 })
      ),
      -1,
      true
    );

    featureIconRotate.value = withRepeat(
      withTiming(360, { duration: 20000 }),
      -1,
      false
    );
  }, []);

  const handlePressIn = useCallback(() => {
    buttonScale.value = withTiming(0.96, { duration: 150 });
  }, []);

  const handlePressOut = useCallback(() => {
    buttonScale.value = withTiming(1, { duration: 150 });
  }, []);

  if (isPending) {
    return (
      <Loader />
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background }
      ]}
      className="web:max-w-7xl web:mx-auto"
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={isPending}
            onRefresh={refetch}
            tintColor={colors.primary}
            progressBackgroundColor={colors.background}
            colors={[colors.primary, '#44d7f8', '#4c8bf8']}
          />
        }
      >
        <View style={styles.headerContainer}>

          <Header user={currentUser!} />
        </View>

        <View style={styles.mainContent}>
          <WelcomeSection
            currentUser={currentUser as User}
            introTextY={introTextY}
            buttonScale={buttonScale}
            handlePressIn={handlePressIn}
            handlePressOut={handlePressOut}
          />

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Essential Features
            </Text>
            <MaterialIcons name="stars" size={24} color={colors.primary} />
          </View>

          <Features />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xxxl * 2,
    position: 'relative',
  },
  headerContainer: {
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: -1,
  },
  backgroundGradient: {
    height: '30%',
    width: '100%',
  },
});
