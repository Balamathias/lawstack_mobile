import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Dimensions, useWindowDimensions } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/Colors';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SPACING } from '@/constants/Spacing';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming, 
  withSequence, 
  withDelay,
  interpolate,
  Extrapolate,
  withRepeat,
  useAnimatedScrollHandler
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import MaskedView from '@react-native-masked-view/masked-view';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  gradient: string[];
  route: string;
};

const features: Feature[] = [
  {
    id: '1',
    title: 'Exam Preparation',
    description: 'Practice questions and study material tailored to your curriculum',
    icon: 'school',
    gradient: ['#7C3AED', '#6D28D9'],
    route: '/courses'
  },
  {
    id: '2',
    title: 'Legal Research',
    description: 'Find cases, statutes, and legal documents with AI assistance',
    icon: 'search',
    gradient: ['#10B981', '#059669'],
    route: '/search'
  },
  {
    id: '3',
    title: 'Case Summaries',
    description: 'Get concise case briefs and analyses of landmark judgments',
    icon: 'description',
    gradient: ['#DB2777', '#BE185D'],
    route: '/cases'
  },
  {
    id: '4',
    title: 'Study Plans',
    description: 'Organized study schedules and reminders for optimal learning',
    icon: 'event',
    gradient: ['#F97316', '#EA580C'],
    route: '/study-plans'
  },
  {
    id: '5',
    title: 'Legal Writing',
    description: 'AI assistance with legal documents and arguments',
    icon: 'edit',
    gradient: ['#0EA5E9', '#0369A1'],
    route: '/legal-writing'
  },
];

// FeatureItem component to handle individual feature rendering and animations
const FeatureItem = React.memo(({ 
  item, 
  index, 
  scrollX, 
  cardWidth, 
  cardSpacing 
}: { 
  item: Feature; 
  index: number; 
  scrollX: Animated.SharedValue<number>; 
  cardWidth: number; 
  cardSpacing: number;
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  
  // Animation values specific to this item
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(0);
  const translateYValue = useSharedValue(20);
  const iconPositionValue = useSharedValue(0);
  
  // Initialize animations
  useEffect(() => {
    // Entrance animation
    const delay = index * 100;
    
    translateYValue.value = withDelay(
      delay,
      withSpring(0, { 
        damping: 18, 
        stiffness: 135, 
        mass: 0.8
      })
    );
    
    opacityValue.value = withDelay(
      delay,
      withTiming(1, { duration: 400 })
    );
    
    // Subtle floating effect for icons
    setTimeout(() => {
      iconPositionValue.value = withRepeat(
        withSequence(
          withTiming(-1.25, { duration: 2200 }),
          withTiming(1.25, { duration: 2200 })
        ),
        -1,
        true
      );
    }, 800 + delay);
  }, []);

  // Calculate position-based animations
  const inputRange = [
    (index - 1) * (cardWidth + cardSpacing),
    index * (cardWidth + cardSpacing),
    (index + 1) * (cardWidth + cardSpacing)
  ];
  
  const rCardStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.92, 1, 0.92],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [
        { scale: scale * scaleValue.value },
        { translateY: translateYValue.value }
      ],
      opacity: opacityValue.value
    };
  });
  
  const rIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: iconPositionValue.value }]
    };
  });
  
  // Touch handlers
  const handlePressIn = () => {
    scaleValue.value = withTiming(0.97, { duration: 150 });
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1, { 
      damping: 15,
      stiffness: 150,
      mass: 0.8
    });
  };
  
  const handlePress = () => {
    if (item.route) {
      try {
        router.push(item?.route as any);
      } catch (error) {
        router.push('/chat');
      }
    }
  };

  return (
    <Animated.View 
      style={[
        styles.cardContainer, 
        rCardStyle,
        { width: cardWidth,  }
      ]}
    >
      <Pressable 
        style={[
          styles.featureItem, 
          { 
            backgroundColor: colors.card, 
            borderColor: isDark ? `${colors.border}60` : `${colors.border}90`
          }
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Card header with icon */}
        <View style={styles.cardHeader}>
          <Animated.View style={[styles.iconWrapper, rIconStyle]}>
            <LinearGradient
              colors={item.gradient as any}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0.8 }}
              locations={[0.3, 0.9]}
              // borderRadius={12}
            />
            <MaterialIcons name={item.icon} size={24} color="white" />
          </Animated.View>
          
          <Text style={[styles.featureTitle, { color: colors.text }]}>
            {item.title}
          </Text>
        </View>
        
        {/* Card content */}
        <View style={styles.cardContent}>
          <Text 
            style={[styles.featureDescription, { color: colors.secondaryText }]} 
            numberOfLines={3}
          >
            {item.description}
          </Text>
        </View>
        
        {/* Card footer */}
        <View style={styles.cardFooter}>
          <LinearGradient
            colors={item.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.actionButton, { overflow: 'hidden' }]}
          >
            <Text style={styles.buttonText}>Explore</Text>
            <MaterialIcons name="arrow-forward" size={16} color="white" />
          </LinearGradient>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const Features = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const { width: windowWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values that can be defined at component level
  const scrollX = useSharedValue(0);
  
  // Calculate appropriate card width based on screen size
  const CARD_WIDTH = Math.min(windowWidth * 0.8, 340);
  const CARD_SPACING = SPACING.lg;
  
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onViewableItemsChanged = React.useCallback(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <FeatureItem
      item={item}
      index={index}
      scrollX={scrollX}
      cardWidth={CARD_WIDTH}
      cardSpacing={CARD_SPACING}
    />
  );

  return (
    <View style={styles.container}>
      <AnimatedFlatList
        ref={flatListRef}
        data={features}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={[
          styles.listContent,
          // { paddingHorizontal: (windowWidth - CARD_WIDTH) / 4 - CARD_SPACING / 2 }
        ]}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        snapToAlignment="center"
        onScroll={scrollHandler}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      
      {/* Pagination dots */}
      <View style={styles.paginationContainer}>
        {features.map((_, index) => {
          const dotWidth = useAnimatedStyle(() => {
            const isActive = activeIndex === index;
            return {
              width: withTiming(isActive ? 24 : 8, { duration: 300 }),
              opacity: withTiming(isActive ? 1 : 0.5, { duration: 300 }),
              backgroundColor: isActive ? colors.primary : colors.secondaryText,
            };
          });
          
          return (
            <Animated.View 
              key={index} 
              style={[styles.paginationDot, dotWidth]} 
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginVertical: SPACING.xl,
  },
  listContent: {
    // paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  cardContainer: {
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureItem: {
    flex: 1,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    overflow: 'hidden',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.2,
  },
  cardContent: {
    flex: 1,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  cardFooter: {
    marginTop: SPACING.lg,
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    height: 36,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginRight: SPACING.xs,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
    height: 8,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});

export default Features;