import { Chat, Message } from "@/@types/db"
import { StackResponse } from "@/@types/generics"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { getChats, deleteChat, getChatMessages, getChat } from "@/services/chats"
import React from "react"
import { getAuthTokens } from "@/lib/auth-storage"
import { API_URL } from "@/constants/Endpoints"

export const useCreateChat = () => {
    
    return useMutation({
        mutationKey: ['create-chat'],
        mutationFn: async (data: Record<string, any>) => {

            const tokens = await getAuthTokens()
            // const res = await axios.post(`${API_URL}/chats/`, data, {
            const res = await axios.post(`${API_URL}/agent/chats/`, data, {
                headers: {
                    Authorization: `Bearer ${tokens?.accessToken}`
                }
            })
            return res.data as StackResponse<Chat | null>
        },
        onError: (error: any) => {
            console.error('Error creating chat:', error)
            if (error?.message?.includes('Authorization')) {
            }
        }
    })
}

export const useSendMessage = (chat_id: string) => {

    
    return useMutation({
        mutationKey: ['send-message'],
        mutationFn: async (data: Record<string, any>) => {
            const tokens = await getAuthTokens()
            if (!tokens) {
                throw new Error('Authorization token is missing.');
            }
            // const res = await axios.post(`${API_URL}/chats/${chat_id}/send-and-respond/`, data, {
            const res = await axios.post(`${API_URL}/agent/chats/${chat_id}/message/`, data, {
                headers: {
                    Authorization: `Bearer ${tokens?.accessToken}`
                }
            })
            return res.data as StackResponse<{ user_message: Message, ai_message: Message }>
        },
        onError: (error) => {
            console.error('Error sending message:', error)
        }
    })
}

export const useGetChats = (params?: Record<string, any>) => {
    return useQuery({
        queryKey: ['get_chats', params],
        queryFn: () => getChats(params),
        enabled: false
    })
}

export const useChatMessages = (chatId: string, params?: Record<string, any>) => {
    return useQuery({
        queryKey: ['get_chat_messages', chatId],
        queryFn: () => getChatMessages(chatId, params),
    })
}

export const useDeleteChat = () => {
    
    return useMutation({
        mutationKey: ['delete-chat'],
        mutationFn: async (chat_id: string) => {
            return await deleteChat(chat_id)
        },
        onError: (error) => {
            console.error('Error deleting chat:', error)
        }
    })
}

export const useGetChat = (chatId: string) => {
    return useQuery({
        queryKey: ['get_chat', chatId],
        queryFn: () => getChat(chatId),
    })
}

/**
 * Hook to send messages in a chat
 */
// export function useChat() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: async (params: {
//       chat_id: string;
//       content: string;
//       role: string;
//       model?: string; // Add model parameter
//     }) => {
//       const { data } = await axios.post(`/api/chat/${params.chat_id}/messages`, params);
//       return data;
//     },
//     onSuccess: (data, variables) => {
//       // Invalidate the chat messages query to trigger a refetch
//       queryClient.invalidateQueries({
//         queryKey: QUERY_KEYS.messages(variables.chat_id),
//       });
      
//       // Update the chat list as well to reflect the latest message preview
//       queryClient.invalidateQueries({
//         queryKey: QUERY_KEYS.chats,
//       });
//     },
//   });
// }

