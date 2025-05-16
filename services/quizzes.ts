import { Quiz, GlobalQuizAnalytics } from '@/@types/db'
import { PaginatedStackResponse, StackResponse } from '@/@types/generics'
import { stackbase } from '@/lib/stackbase'

interface QuizPayload {
    params?: Record<string, string | number | boolean>
}

export const getQuizzes = async (payload?: QuizPayload): Promise<PaginatedStackResponse<Quiz[]>> => {
    try {
        const { data } = await stackbase.get('/quizzes/', { ...payload })
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

export const getQuiz = async (id: string): Promise<StackResponse<Quiz | null>> => {
    try {
        const { data } = await stackbase.get(`/quizzes/${id}/`)
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

export const createQuiz = async (payload: Partial<Quiz>): Promise<StackResponse<Quiz | null>> => {
    try {
        const { data } = await stackbase.post('/quizzes/', payload)
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

export const updateQuiz = async (id: string, payload: Partial<Quiz>): Promise<StackResponse<Quiz | null>> => {
    try {
        const { data } = await stackbase.put(`/quizzes/${id}/`, payload)
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

export const deleteQuiz = async (id: string): Promise<StackResponse<Quiz | null>> => {
    try {
        const { data } = await stackbase.delete(`/quizzes/${id}/`)
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

export const getQuizzesAnalytics = async (): Promise<StackResponse<GlobalQuizAnalytics | null>> => {
    try {
        const { data } = await stackbase.get('/quizzes/global_analytics/')
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
