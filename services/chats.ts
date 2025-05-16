import { Chat, GlobalChatAnalytics, Message } from '@/@types/db'
import { PaginatedStackResponse, StackResponse } from '@/@types/generics'
import { stackbase } from '@/lib/stackbase'

interface ChatPayload {
    params?: Record<string, string | number | boolean>
}

export const getChats = async (payload?: ChatPayload): Promise<PaginatedStackResponse<Chat[]>> => {    
    try {
        const { data } = await stackbase.get('/agent/chats/', { ...payload })
        return data
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error.response?.data?.detail,
            error: error?.response?.data,
            data: [],
            status: error?.response?.status,
            count: 0,
            next: '',
            previous: ''
        }
    }
}

export const getChat = async (id: string): Promise<StackResponse<Chat | null>> => {
    try {
        const { data } = await stackbase.get(`/chats/${id}/`)
        return data
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status
        }
    }
}

export const createChat = async (payload: Partial<Chat>): Promise<StackResponse<Chat | null>> => {
    try {
        const { data } = await stackbase.post('/chats/', payload)
        return data
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status
        }
    }
}

export const deleteChat = async (id: string): Promise<StackResponse<Chat | null>> => {
    try {
        const { data } = await stackbase.delete(`/chats/${id}/`)
        return data
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status
        }
    }
}

export const getChatMessages = async (id: string, params?: Record<string, any>): Promise<PaginatedStackResponse<Message[] | null>> => {
    try {
        const { data } = await stackbase.get(`/chats/${id}/messages/`, { params })
        return data
    } catch (error: any) {
        return {
            message: error?.response?.data?.message || error.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status,
            count: 0,
            next: '',
            previous: ''
        }
    }
}

export const getChatsAnalytics = async (): Promise<StackResponse<GlobalChatAnalytics | null>> => {
  try {
    const { data } = await stackbase.get('/chats/global_analytics/')
    return data
  } catch (error: any) {
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: null,
      status: error?.response?.status
    }
  }
}