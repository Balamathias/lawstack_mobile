import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { Colors } from '@/constants/Colors';
import { SPACING } from '@/constants/Spacing';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { 
  FadeIn,
  SlideInRight
} from 'react-native-reanimated';
import { Question } from '@/@types/db';
import Markdown from 'react-native-markdown-display';

type QuestionItemProps = {
  question: Question;
  index: number;
  number: number;
};

const QuestionItem = ({ question, index, number }: QuestionItemProps) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();

  const handlePress = () => {
    router.push(`/past-questions/${question.id}` as any);
  };
  
  // Get year and session display
  const getYearSession = () => {
    let display = question.year || '';
    if (question.session) {
      display += display ? ` • ${question.session}` : question.session;
    }
    return display;
  };
  
  // Truncate text for preview
  const truncateText = (text: string, maxLength: number = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength).trim() + '...';
  };
  
  const displayText = question.text_plain ? truncateText(question.text_plain) : truncateText(question.text);
  const yearSession = getYearSession();

  return (
    <Animated.View
      entering={SlideInRight.delay(index * 100).springify().damping(15)}
    >
      <TouchableOpacity
        style={[
          styles.container,
          { 
            backgroundColor: colors.card,
            borderColor: isDark ? `${colors.border}60` : colors.border,
          }
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <View style={styles.headerRow}>
          <View 
            style={[
              styles.numberCircle, 
              { backgroundColor: `${colors.primary}15` }
            ]}
          >
            <Text style={[styles.numberText, { color: colors.primary }]}>
              {number}
            </Text>
          </View>
          
          {yearSession ? (
            <View style={[styles.yearBadge, { backgroundColor: `${colors.primary}10` }]}>
              <Text style={[styles.yearText, { color: colors.primary }]}>
                {yearSession}
              </Text>
            </View>
          ) : null}
        </View>
        
        <View style={styles.content}>
          <Markdown
            style={{
              body: { color: colors.text, fontSize: 14, lineHeight: 20 },
              heading1: { fontSize: 16, fontWeight: 'bold', color: colors.text },
              heading2: { fontSize: 15, fontWeight: 'bold', color: colors.text },
              heading3: { fontSize: 14, fontWeight: 'bold', color: colors.text },
              link: { color: colors.primary },
              blockquote: { 
                backgroundColor: isDark ? `${colors.secondaryBackground}50` : `${colors.secondaryBackground}90`,
                borderLeftColor: colors.primary,
                paddingLeft: 10,
                paddingVertical: 5,
                borderLeftWidth: 3,
              },
              image: { width: '100%', height: 200, resizeMode: 'contain' },
            }}
          >
            {displayText}
          </Markdown>
        </View>
        
        <View style={styles.footer}>
          {question.marks ? (
            <View style={styles.marksContainer}>
              <MaterialIcons name="star" size={14} color={colors.primary} />
              <Text style={[styles.marksText, { color: colors.secondaryText }]}>
                {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
              </Text>
            </View>
          ) : null}
          
          <View style={styles.viewAction}>
            <Text style={[styles.viewText, { color: colors.primary }]}>
              View question
            </Text>
            <MaterialIcons name="chevron-right" size={16} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  numberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  yearBadge: {
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    borderRadius: 12,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  marksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marksText: {
    fontSize: 12,
  },
  viewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

export default QuestionItem;
