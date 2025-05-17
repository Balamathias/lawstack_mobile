import { View, Text, ActivityIndicator, ScrollView } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ThemedView'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useQuestion } from '@/services/hooks/question'
import MarkdownPreview from '@/components/MarkdownPreview'
import { Colors } from '@/constants/Colors'
import Loader from '@/components/Loader'

const QuestionDetail = () => {
  const { question_id } = useLocalSearchParams<{ question_id: string }>()

  const { data, error, isPending } = useQuestion(question_id)

  const question = data?.data

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
          title: question?.text_plain || 'Question',
        }}
      />
      <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>
        <MarkdownPreview scrollEnabled={false} content={question?.text || ''} />
      </ScrollView>
    </ThemedView>
  )
}

export default QuestionDetail