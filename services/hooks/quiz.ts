import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { 
  createQuiz, 
  getQuiz, 
  getQuizzes, 
  startQuiz, 
  submitAnswer, 
  completeQuiz,
  getQuizStatistics,
  generateMCQuestions,
  CreateQuizParams,
  SubmitAnswerParams,
  GenerateMCQParams
} from "@/services/quiz"
import { QUERY_KEYS } from "./query-keys"

/**
 * Hook to fetch all quizzes for the current user
 */
export const useQuizzes = (params?: Record<string, string | number | boolean>) => {
  return useQuery({
    queryKey: [QUERY_KEYS.get_quizzes, params],
    queryFn: async () => getQuizzes(params)
  })
}

/**
 * Hook to fetch a single quiz by ID
 */
export const useQuiz = (id: string, options?: any) => {
  return useQuery({
    queryKey: [QUERY_KEYS.get_quiz, id],
    queryFn: () => getQuiz(id),
    enabled: !!id,
    retry: 1, // Only retry once for 404s
    staleTime: 5 * 1000, // 5 seconds
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid disruptions during quiz
  })
}

/**
 * Hook to create a new quiz
 */
export const useCreateQuiz = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationKey: [QUERY_KEYS.create_quiz],
    mutationFn: (params: CreateQuizParams) => createQuiz(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_quizzes] })
    }
  })
}

/**
 * Hook to start a quiz
 */
export const useStartQuiz = (id: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationKey: [QUERY_KEYS.start_quiz, id],
    mutationFn: () => startQuiz(id),
    onSuccess: (data) => {
      // Update the quiz data cache immediately
      queryClient.setQueryData([QUERY_KEYS.get_quiz, id], data)
      
      // Force a refetch to ensure we have the complete data
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.get_quiz, id],
        refetchType: 'active'
      })
      
      // Also invalidate the quizzes list
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.get_quizzes]
      })
    }
  })
}

/**
 * Hook to submit an answer to a quiz question
 */
export const useSubmitAnswer = (quizId: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationKey: [QUERY_KEYS.submit_answer, quizId],
    mutationFn: (params: SubmitAnswerParams) => submitAnswer(quizId, params),
    onSuccess: (data) => {
      // Force refresh the quiz data after submitting an answer
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_quiz, quizId] })
      
      if (data.status >= 400) {
        console.error("Answer submission error:", data.message, data.error)
      }
    },
    onError: (error) => {
      console.error("Error submitting answer:", error)
    }
  })
}

/**
 * Hook to complete a quiz
 */
export const useCompleteQuiz = (id: string) => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationKey: [QUERY_KEYS.complete_quiz, id],
    mutationFn: () => completeQuiz(id),
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEYS.get_quiz, id], data)
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_quizzes] })
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.get_quiz_stats] })
    }
  })
}

/**
 * Hook to get quiz statistics
 */
export const useQuizStatistics = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.get_quiz_stats],
    queryFn: async () => getQuizStatistics()
  })
}

/**
 * Hook to generate new MCQ questions
 */
export const useGenerateMCQuestions = () => {
  return useMutation({
    mutationKey: [QUERY_KEYS.generate_mcq],
    mutationFn: (params: GenerateMCQParams) => generateMCQuestions(params)
  })
}
