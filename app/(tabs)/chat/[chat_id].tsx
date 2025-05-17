import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import ChatInterface from '@/components/chat/ChatInterface';
import { useChatMessages, useGetChat } from '@/services/hooks/chat';
import { Colors } from '@/constants/Colors';

const ChatDetail = () => {
  const { chat_id } = useLocalSearchParams();
  const { data: messages, isPending, refetch } = useChatMessages(chat_id as string, { tool_call: false, page_size: 500 })
  const { data: chat, isPending: isChatPending, refetch: refetchChat } = useGetChat(chat_id as string)

    if (isPending || isChatPending) {
        return (
        <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size='large' color={Colors.dark.primary} />
        </View>
        )
    }

  return (
    <View className='flex flex-1'>
        <ChatInterface 
            chatId={chat_id as string}
            initialMessages={messages?.data || []}
            chat={chat?.data!}
            onRefresh={() => {
                refetch()
                refetchChat()
            }}
            refreshing={isPending || isChatPending}
        />
    </View>
  )
}

export default ChatDetail;