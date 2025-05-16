import { PaginatedStackResponse, StackResponse } from '@/@types/generics'
import { GlobalQuizAnalytics, Quiz, QuizStatistics } from '@/@types/db'
import { stackbase } from '@/lib/stackbase'

/**
 * Get all quizzes for the current user with pagination
 */
export const getQuizzes = async (
  params?: Record<string, string | number | boolean>
): Promise<PaginatedStackResponse<Quiz[]>> => {
  try {
    const { data } = await stackbase.get('/quizzes/', { params })
    return data
  } catch (error: any) {
    console.error("Error fetching quizzes:", error?.response?.status, error?.response?.data)
    return {
      message: error?.response?.data?.message || error.response?.data?.detail || "Failed to fetch quizzes",
      error: error?.response?.data,
      data: [],
      status: error?.response?.status || 500,
      count: 0,
      next: '',
      previous: ''
    }
  }
}

/**
 * Get a single quiz by ID with full details
 */
export const getQuiz = async (id: string): Promise<StackResponse<Quiz | null>> => {
  try {
    console.log("Fetching quiz with ID:", id)
    const { data } = await stackbase.get(`/quizzes/${id}/`)
    console.log("Quiz fetch successful:", !!data?.data)
    console.log("Quiz data:", data)
    return data
  } catch (error: any) {
    console.error("Error fetching quiz:", id, error?.response?.status, error?.response?.data)
    
    // If we get a 404, handle it gracefully
    if (error?.response?.status === 404) {
      return {
        message: "Quiz not found",
        error: { detail: "The requested quiz could not be found" },
        data: null,
        status: 404
      }
    }
    
    return {
      message: error?.response?.data?.message || error.response?.data?.detail || "Failed to fetch quiz",
      error: error?.response?.data,
      data: null,
      status: error?.response?.status || 500
    }
  }
}

/**
 * Create a new quiz
 */
export interface CreateQuizParams {
  title: string
  course: string
  total_questions?: number
  duration?: number,
  difficulty?: string,
  semester?: string,
  reuse_questions?: boolean
}

export const createQuiz = async (params: CreateQuizParams): Promise<StackResponse<Quiz | null>> => {
  try {
    const { data } = await stackbase.post('/quizzes/', {
      ...params,
      total_questions: params.total_questions || 10,
      duration: params.duration || 15
    })
    return data
  } catch (error: any) {
    console.error(error.toJSON())
    return {
      message: error?.response?.data?.message || error.response?.data?.detail,
      error: error?.response?.data,
      data: null,
      status: error?.response?.status
    }
  }
}

/**
 * Start a quiz
 */
export const startQuiz = async (id: string): Promise<StackResponse<Quiz | null>> => {
  try {
    console.log(`Starting quiz with ID: ${id}`)
    const { data } = await stackbase.post(`/quizzes/${id}/start/`)
    console.log("Quiz started successfully:", !!data.data)
    return data
  } catch (error: any) {
    console.error("Error starting quiz:", error?.response?.status, error?.response?.data)
    return {
      message: error?.response?.data?.message || error.response?.data?.detail || "Failed to start quiz",
      error: error?.response?.data,
      data: null,
      status: error?.response?.status || 500
    }
  }
}

/**
 * Submit an answer to a quiz question
 */
export interface SubmitAnswerParams {
  quiz_question_id: string
  selected_option: string
  time_taken?: number
}

export const submitAnswer = async (
  quizId: string, 
  params: SubmitAnswerParams
): Promise<StackResponse<any>> => {
  try {
    console.log("Submitting answer:", quizId, params)
    const { data } = await stackbase.post(`/quizzes/${quizId}/submit-answer/`, params)
    return data
  } catch (error: any) {
    console.error("Error submitting answer:", error?.response?.status, error?.response?.data)
    return {
      message: error?.response?.data?.message || error.response?.data?.detail || "Failed to submit answer",
      error: error?.response?.data,
      data: null,
      status: error?.response?.status || 500
    }
  }
}

/**
 * Complete a quiz and get results
 */
export const completeQuiz = async (id: string): Promise<StackResponse<Quiz | null>> => {
  try {
    const { data } = await stackbase.post(`/quizzes/${id}/complete/`)
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

/**
 * Get quiz statistics for the current user
 */
export const getQuizStatistics = async (): Promise<StackResponse<QuizStatistics | null>> => {
  try {
    const { data } = await stackbase.get('/quizzes/stats/')
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

/**
 * Generate new MCQ questions for a course
 */
export interface GenerateMCQParams {
  course_id: string
  count?: number
  difficulty?: 'easy' | 'medium' | 'hard'
}

export const generateMCQuestions = async (
  params: GenerateMCQParams
): Promise<StackResponse<any>> => {
  try {
    const { data } = await stackbase.post('/mcquestions/generate/', {
      ...params,
      count: params.count || 10
    })
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