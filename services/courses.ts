import { StackResponse, PaginatedStackResponse } from '@/@types/generics'
import { Course, CourseAnalytics, GlobalCourseAnalytics } from '@/@types/db'
import { stackbase } from '@/lib/stackbase'

interface CoursePayload {
    params?: Record<string, string | number | boolean>
}

export const getCourses = async (payload?: CoursePayload): Promise<PaginatedStackResponse<Course[]>> => {
    try {
        const { data } = await stackbase.get('/courses/', { ...payload })
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

export const getCourse = async (id: string): Promise<StackResponse<Course | null>> => {
    try {
        const { data } = await stackbase.get(`/courses/${id}/`)
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

export const createCourse = async (payload: Course): Promise<StackResponse<Course | null>> => {
    try {
        const { data } = await stackbase.post('/courses/', payload)
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

export const updateCourse = async (id: string, payload: Partial<Course>): Promise<StackResponse<Course | null>> => {
    try {
        const { data } = await stackbase.put(`/courses/${id}/`, payload)
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

export const deleteCourse = async (id: string): Promise<StackResponse<Course | null>> => {
    try {
        const { data } = await stackbase.delete(`/courses/${id}`)
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

export const getCoursesAnalytics = async (): Promise<StackResponse<GlobalCourseAnalytics | null>> => {
    try {
        const { data } = await stackbase.get('/courses/global_analytics/')
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

export const getCourseAnalytics = async (id: string): Promise<StackResponse<CourseAnalytics | null>> => {
    try {
        const { data } = await stackbase.get(`/courses/${id}/analytics/`)
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