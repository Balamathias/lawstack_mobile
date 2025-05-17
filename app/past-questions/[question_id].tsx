import { View, Text, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect } from 'react'
import { ThemedView } from '@/components/ThemedView'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useQuestion } from '@/services/hooks/question'
import MarkdownPreview from '@/components/MarkdownPreview'
import { Colors } from '@/constants/Colors'
import Loader from '@/components/Loader'
import { clearAuth } from '@/lib/auth-storage'

const QuestionDetail = () => {
  const { question_id } = useLocalSearchParams<{ question_id: string }>()

  const { data, error, isPending } = useQuestion(question_id)

  const question = data?.data
  useEffect(() => {clearAuth()}, [])

    if (isPending) {
        return (
        <Loader />
        )
    }


  return (
    <ThemedView className='flex-1 flex h-full p-4'>
      <Stack.Screen 
      options={{
        headerShown: true,
        title: question?.text_plain 
        ? (question.text_plain.substring(0, 25) + '...') 
        : 'Question',
      }}
      />
      <ScrollView 
      showsVerticalScrollIndicator={false} 
      className='flex-1 mb-4'
      contentContainerStyle={{ paddingBottom: 20 }}
      >
      {question ? (
        <MarkdownPreview 
        scrollEnabled={false} 
        content={question.text || ''}
        containerStyle={{ 
          padding: 4, 
          backgroundColor: 'transparent',
          marginBottom: 16
        }}
        />
      ) : (
        <Text className="text-center p-4 italic">No question content available</Text>
      )}
      </ScrollView>
    </ThemedView>
  )
}

export default QuestionDetail