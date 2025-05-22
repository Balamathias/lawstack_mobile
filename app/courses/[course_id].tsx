import CourseDetail from '@/components/courses/CourseDetail'
import { ThemedView } from '@/components/ThemedView'
import React from 'react'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const CourseDetailScreen = () => {
  return (
    <ThemedView className='flex-1 h-full'>
        <SafeAreaView className='flex-1 h-full'>
          <CourseDetail />
        </SafeAreaView>
    </ThemedView>
  )
}

export default CourseDetailScreen