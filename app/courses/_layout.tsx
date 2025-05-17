import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const Layout = () => {
  return (
    <Stack>
        <Stack.Screen name='index' options={{ headerShown: true, title: 'Courses' }} />
        <Stack.Screen name='[course_id]' options={{ headerShown: false }} />
    </Stack>
  )
}

export default Layout