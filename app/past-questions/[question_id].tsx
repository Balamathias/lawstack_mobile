import { MaterialIcons } from '@expo/vector-icons';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useRef } from 'react';
import { Platform, ScrollView, Share, Text, TouchableOpacity, useColorScheme, useWindowDimensions, View } from 'react-native';

import { Question } from '@/@types/db';
import Loader from '@/components/Loader';
import MarkdownPreview from '@/components/MarkdownPreview';
import { ThemedSafeAreaView } from '@/components/ThemedSafeAreaView';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useQuestion } from '@/services/hooks/question';
import { SafeAreaView } from 'react-native-safe-area-context';

const QuestionDetail = () => {
  const { question_id } = useLocalSearchParams<{ question_id: string }>();
  const { data, error, isPending } = useQuestion(question_id);
  const question = data?.data as Question | undefined;
  const colorScheme = useColorScheme() || 'light';
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const { width } = useWindowDimensions();
  const scrollViewRef = useRef<ScrollView>(null);

  const handleShare = useCallback(() => {
    if (question) {
      Share.share({
        title: `Question: ${question.course_name}`,
        message: question.text_plain || question.text || 'Check out this question',
      });
    }
  }, [question]);

  if (isPending) {
    return <Loader />;
  }

  if (error) {
    return (
      <ThemedView className="flex-1 justify-center items-center p-4">
        <Text className="text-red-500 text-center">
          Error loading question: {error.message}
        </Text>
        <TouchableOpacity 
          className="mt-4 bg-emerald-500 py-2 px-4 rounded-lg" 
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Go Back</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1 flex">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <Stack.Screen 
        options={{
          headerShown: true,
          headerStyle: {
            backgroundColor: colors.background,
          },
          header: () => (
            <View style={{
              backgroundColor: colors.background,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              paddingTop: Platform.OS === 'ios' ? 50 : 16,
              paddingBottom: 12,
              paddingHorizontal: 16,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 3,
            }}>
              <SafeAreaView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left: Back button with gradient */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <TouchableOpacity 
                    onPress={() => router.back()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaskedView
                      style={{ height: 32, width: 32 }}
                      maskElement={
                        <MaterialIcons
                          name="arrow-back"
                          size={24}
                          color="black"
                          style={{ alignSelf: 'center' }}
                        />
                      }
                    >
                      <LinearGradient
                        colors={['#10B981', '#8B5CF6', '#48ec74', '#F59E0B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                      />
                    </MaskedView>
                  </TouchableOpacity>

                  {/* Middle: Question title (truncated) */}
                  <Text 
                    numberOfLines={1} 
                    ellipsizeMode="tail"
                    style={{ 
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.text,
                      flex: 1,
                      marginTop: -6
                    }}
                  >
                    {question?.course_name || 'Question Details'}
                  </Text>
                </View>

                {/* Right: Actions */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <TouchableOpacity onPress={handleShare}>
                    <MaskedView
                      style={{ height: 32, width: 32 }}
                      maskElement={
                        <MaterialIcons
                          name="share"
                          size={22}
                          color="black"
                          style={{ alignSelf: 'center' }}
                        />
                      }
                    >
                      <LinearGradient
                        colors={['#10B981', '#8B5CF6', '#48ec76', '#F59E0B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                      />
                    </MaskedView>
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <MaskedView
                      style={{ height: 32, width: 32 }}
                      maskElement={
                        <MaterialIcons
                          name="bookmark-border"
                          size={22}
                          color="black"
                          style={{ alignSelf: 'center' }}
                        />
                      }
                    >
                      <LinearGradient
                        colors={['#10B981', '#8B5CF6', '#48ec76', '#F59E0B']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ flex: 1 }}
                      />
                    </MaskedView>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          ),
        }}
      />
      
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Question content */}
        {question ? (
          <View style={{ padding: 16 }}>
            {/* Metadata banner */}
            <View 
              style={{ 
                backgroundColor: colors.secondaryBackground, 
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="school" size={18} color={colors.primary} />
                  <Text style={{ color: colors.text, marginLeft: 8, fontWeight: '500' }}>
                    {question.institution_name || question.institution || 'Institution'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="event" size={18} color={colors.primary} />
                  <Text style={{ color: colors.text, marginLeft: 8, fontWeight: '500' }}>
                    {question.year || 'N/A'}
                  </Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="book" size={18} color={colors.primary} />
                  <Text style={{ color: colors.text, marginLeft: 8, fontWeight: '500' }}>
                    {question.course_name || question.course || 'Course'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="calendar-today" size={18} color={colors.primary} />
                  <Text style={{ color: colors.text, marginLeft: 8, fontWeight: '500' }}>
                    {question.semester ? `${question.semester} Semester` : 'N/A'}
                  </Text>
                </View>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="format-list-numbered" size={18} color={colors.primary} />
                  <Text style={{ color: colors.text, marginLeft: 8, fontWeight: '500' }}>
                    {question.marks ? `${question.marks} Mark${question.marks !== 1 ? 's' : ''}` : 'N/A'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MaterialIcons name="label" size={18} color={colors.primary} />
                  <Text style={{ color: colors.text, marginLeft: 8, fontWeight: '500' }}>
                    {question.type || 'N/A'}
                  </Text>
                </View>
              </View>
              
              {/* Tags */}
              {question.tags && question.tags.length > 0 && (
                <View style={{ marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {question.tags.map((tag, index) => (
                    <View 
                      key={index} 
                      style={{ 
                        backgroundColor: colors.primaryLight, 
                        paddingHorizontal: 10, 
                        paddingVertical: 4,
                        borderRadius: 16,
                      }}
                    >
                      <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '500' }}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
            
            {/* Question content */}
            <View style={{
              marginBottom: 24,
              backgroundColor: colors.background,
              borderRadius: 12,
              overflow: 'hidden',
            }}>
              <View style={{ 
                padding: 16,
                backgroundColor: colors.background,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12,
              }}>
                <Text style={{ 
                  fontSize: 18, 
                  fontWeight: '600', 
                  color: colors.text,
                  marginBottom: 8
                }}>
                  Question
                </Text>
              </View>
              
              <MarkdownPreview 
                scrollEnabled={false} 
                content={question.text || ''}
                containerStyle={{ 
                  padding: 16, 
                  backgroundColor: 'transparent',
                  paddingTop: 0,
                }}
              />
            </View>
            
            {/* Expert solutions section */}
            <View style={{
              padding: 16,
              backgroundColor: colors.secondaryBackground,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              marginBottom: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <MaterialIcons name="tips-and-updates" size={20} color={colors.primary} />
                <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginLeft: 8 }}>
                  Expert Solutions
                </Text>
              </View>
              
              <Text style={{ color: colors.secondaryText }}>
                Get expert solutions and explanations for this question using our AI assistant.
              </Text>
              
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  padding: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginTop: 16,
                }}
                onPress={() => {
                  if (question?.id) {
                    // Navigate to AI chat with this question
                    // router.push(`/chat/new?question_id=${question.id}`);
                  }
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  Get Solution
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ padding: 16, alignItems: 'center', justifyContent: 'center', height: 200 }}>
            <Text style={{ color: colors.secondaryText, fontStyle: 'italic' }}>
              No question content available
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 16,
                backgroundColor: colors.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
              onPress={() => router.back()}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Go Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Bottom action buttons */}
      {question && (
        <View style={{ 
          flexDirection: 'row', 
          paddingHorizontal: 16, 
          paddingVertical: 12, 
          borderTopWidth: 1, 
          borderTopColor: colors.border,
          backgroundColor: colors.background,
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.secondaryBackground,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
              marginRight: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            onPress={() => {
              // Add contribution functionality
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '500' }}>
              Add Contribution
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.primary,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
              marginLeft: 8,
            }}
            onPress={() => {
              if (question?.id) {
                // Navigate to AI chat with this question
                // router.push(`/chat/new?question_id=${question.id}`);
              }
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '500' }}>
              Ask AI Assistant
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
};

export default QuestionDetail;