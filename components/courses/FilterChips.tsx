import React from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import Animated, { 
  FadeInRight, 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming
} from 'react-native-reanimated';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';
import { MaterialIcons } from '@expo/vector-icons';

type FilterChipsProps = {
  selectedLevel: string | null;
  onLevelSelect: (level: string | null) => void;
};

const levels = [
  { value: '100', label: '100 Level' },
  { value: '200', label: '200 Level' },
  { value: '300', label: '300 Level' },
  { value: '400', label: '400 Level' },
  { value: '500', label: '500 Level' }
];

const FilterChips = ({ selectedLevel, onLevelSelect }: FilterChipsProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  
  // Animation values for the clear button
  const clearButtonOpacity = useSharedValue(selectedLevel ? 1 : 0);
  
  // Update clear button opacity when selection changes
  React.useEffect(() => {
    clearButtonOpacity.value = withTiming(selectedLevel ? 1 : 0, { duration: 200 });
  }, [selectedLevel]);
  
  // Animated style for clear button
  const clearButtonStyle = useAnimatedStyle(() => ({
    opacity: clearButtonOpacity.value,
    transform: [{ scale: clearButtonOpacity.value }],
  }));
  
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipContainer}
      >
        {levels.map((level) => {
          const isSelected = selectedLevel === level.value;
          
          return (
            <TouchableOpacity
              key={level.value}
              style={[
                styles.chip,
                { 
                  backgroundColor: isSelected ? colors.primary : colors.secondaryBackground,
                  borderColor: isSelected ? colors.primary : colors.border
                }
              ]}
              onPress={() => onLevelSelect(isSelected ? null : level.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: isSelected ? 'white' : colors.secondaryText }
                ]}
              >
                {level.label}
              </Text>
              
              {isSelected && (
                <MaterialIcons
                  name="check"
                  size={16}
                  color="white"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Clear button */}
      {selectedLevel && (
        <Animated.View style={[styles.clearButton, clearButtonStyle]}>
          <TouchableOpacity 
            onPress={() => onLevelSelect(null)}
            style={[
              styles.clearButtonInner, 
              { backgroundColor: colors.secondaryBackground }
            ]}
          >
            <MaterialIcons name="close" size={16} color={colors.secondaryText} />
            <Text style={[styles.clearText, { color: colors.secondaryText }]}>
              Clear
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chipContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
    flexDirection: 'row',
  },
  chip: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
  },
  checkIcon: {
    marginLeft: 4,
  },
  clearButton: {
    position: 'absolute',
    right: SPACING.lg,
  },
  clearButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
  },
  clearText: {
    marginLeft: 2,
    fontSize: 12,
  }
});

export default FilterChips;
