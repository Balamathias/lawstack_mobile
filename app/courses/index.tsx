import { View, Text } from 'react-native'
import React from 'react'
import CourseList from '@/components/courses/CourseList'

const CourseScreen = () => {
  return (
    <View className='flex-1'>
      <CourseList />
    </View>
  )
}

export default CourseScreen