import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const Layout = () => {
  return (
    <Stack>
        <Stack.Screen name='index' options={{ headerShown: false }} />
        <Stack.Screen name='[chat_id]' options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  )
}

export default Layout;