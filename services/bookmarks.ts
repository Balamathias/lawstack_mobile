import { Bookmark } from '@/@types/db'
import { PaginatedStackResponse, StackResponse } from '@/@types/generics'
import { stackbase } from '@/lib/stackbase'


interface BookmarkPayload {
    params?: Record<string, string | number | boolean>
}

export const getBookmarks = async (payload?: BookmarkPayload): Promise<PaginatedStackResponse<Bookmark[]>> => {    
    try {
        const { data } = await stackbase.get('/bookmarks/', { ...payload })
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

export const getBookmark = async (id: string): Promise<StackResponse<Bookmark | null>> => {
    try {
        const { data } = await stackbase.get(`/bookmarks/${id}/`)
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

export const createBookmark = async (payload: { past_question_id: string }): Promise<StackResponse<Bookmark | null>> => {
    try {
        const { data } = await stackbase.post('/bookmarks/', payload)
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

export const deleteBookmark = async (id: string): Promise<StackResponse<Bookmark | null>> => {
    try {
        const { data } = await stackbase.delete(`/bookmarks/${id}/`)
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

export const isBookmarked = async (question_id: string): Promise<StackResponse<{ bookmarked: boolean } | null>> => {
    try {
        const { data } = await stackbase.get(`/bookmarks/is_bookmarked/`, { params: { past_question_id: question_id } })
        return data
    } catch (error: any) {
        console.log(error?.response?.data)
        return {
            message: error?.response?.data?.message || error.response?.data?.detail,
            error: error?.response?.data,
            data: null,
            status: error?.response?.status
        }
    }
}