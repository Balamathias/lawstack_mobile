import { View, Text } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/ThemedView'
import SearchVibes from '@/components/html/SearchVibes'
import { ThemedText } from '@/components/ThemedText'

const SearchScreen = () => {
  return (
    <ThemedView className='flex-1 h-full'>
      <SearchVibes />

    <ThemedText type='title'>SearchVibes</ThemedText>
    </ThemedView>
  )
}

export default SearchScreen