import { View, Text } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import CourseQuestions from '@/components/courses/CourseQuestions'
import { ThemedView } from '@/components/ThemedView'

const QuestionsScreen = () => {
  const { course_id } = useLocalSearchParams<{ course_id?: string }>()
  return (
    <ThemedView className='flex-1 flex h-full p-4'>
      <CourseQuestions courseId={course_id!} />
    </ThemedView>
  )
}

export default QuestionsScreen