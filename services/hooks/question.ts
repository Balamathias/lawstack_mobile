import { useMutation, useQuery } from "@tanstack/react-query"
import { getTypingSuggestions, getQuestions, getQuestion } from "@/services/questions"
import { QUERY_KEYS } from "./query-keys";
// import { getQuestionInsights } from "@/services/ai";
import { Question, User } from "@/@types/db";
import { useUser } from "./auth";
import axios from "axios";

// Add a new hook to fetch questions with filtering support
export const useQuestions = (payload?: { params?: Record<string, string | number | boolean> }) => {
    return useQuery({
        queryKey: [QUERY_KEYS.get_questions, payload],
        queryFn: async () => {
            return getQuestions(payload);
        },
    });
};

// Add a hook to fetch a single question by ID
export const useQuestion = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.get_question, id],
        queryFn: async () => {
            return getQuestion(id);
        },
        enabled: !!id,
    });
};

export const useQuestionSuggestions = (query: string) => {
    
    return useQuery({
        queryKey: [QUERY_KEYS.get_questions, query],
        queryFn: async () => {
            if (query.length === 0) return { data: [] }
            return getTypingSuggestions({ params: { q: query } })
        },
    });
};

export const useQuestionInsights = () => {
    return useMutation({
        // mutationKey: [QUERY_KEYS.get_question_insights],
        // mutationFn: ({ question, user, prompt }: { question: Question, user: User, prompt: string }) => {
        //     return getQuestionInsights(prompt, question, user);
        // },
    });
}


export const useQuestionInsights_Edge = () => {

    const { data: user } = useUser()
    
    return useMutation({
        mutationKey: [QUERY_KEYS.get_question_insights_edge],
        mutationFn: async ({ question, prompt }: { question: Question, user: User, prompt: string, }) => {
            const { data } = await axios.post('/api/ai/generate', {
                prompt,
                question,
                type: 'question',
                user
            });
            console.log(data)
            return data.insights as string | null
        },
        onError: (error) => {
            console.error(error)
        }
    });
}