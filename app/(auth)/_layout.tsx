import { Stack } from 'expo-router'
import React from 'react'

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen
        name='login'
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name='register'
        options={{
          headerShown: false,
        }}
      />
      
      <Stack.Screen
        name='verify-otp'
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  )
}

export default Layout