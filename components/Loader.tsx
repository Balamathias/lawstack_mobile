import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
import { ThemedView } from './ThemedView'
import { Colors } from '@/constants/Colors'

const Loader = () => {
  return (
    <ThemedView className='flex-1 flex h-full p-4 items-center justify-center'>
        <ActivityIndicator
            size='large'
            color={Colors.light.primary}
            className='flex-1 justify-center items-center'
        />
    </ThemedView>
  )
}

export default Loader