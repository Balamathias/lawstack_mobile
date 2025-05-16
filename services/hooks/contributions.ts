import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "./query-keys";
import { Contribution, Question, User } from '@/@types/db';
import { createContribution, deleteContribution, getContribution, getContributions, updateContribution } from "@/services/contributions";
// import { getContributionInsights } from "../ai";
import axios from "axios";
import { useUser } from "./auth";

interface ContributionPayload {
    params?: Record<string, string | number | boolean>;
}

export const useContributions = (payload?: ContributionPayload) => {
    return useQuery({
        queryKey: [QUERY_KEYS.get_contributions, payload],
        queryFn: async () => {
            return getContributions(payload);
        },
    });
};

export const useContribution = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.get_contribution, id],
        queryFn: async () => {
            return getContribution(id);
        },
    });
};

export const useCreateContribution = () => {
    return useMutation({
        mutationKey: [QUERY_KEYS.create_contribution],
        mutationFn: (payload: Partial<Contribution>) => {
            return createContribution(payload);
        },
    });
};

export const useUpdateContribution = () => {
    return useMutation({
        mutationKey: [QUERY_KEYS.update_contribution],
        mutationFn: ({ id, payload }: { id: string; payload: Partial<Contribution> }) => {
            return updateContribution(id, payload);
        },
    });
};

export const useDeleteContribution = () => {
    return useMutation({
        mutationKey: [QUERY_KEYS.delete_contribution],
        mutationFn: (id: string) => {
            return deleteContribution(id);
        },
    });
};

export const useContributionInsights = () => {
    return useMutation({
        mutationKey: [QUERY_KEYS.get_contribution_insights],
        // mutationFn: ({ question, contribution, prompt }: { question: Question, contribution: Contribution, prompt: string }) => {
        //     // return getContributionInsights({prompt, question, contribution});
        // },
    });
}

export const useContributionInsights_Edge = () => {

    const { data: user } = useUser()

    return useMutation({
        mutationKey: [QUERY_KEYS.get_contribution_insights_edge],
        mutationFn: async ({ question, contribution, prompt }: { question: Question, contribution: Contribution, prompt: string, }) => {
            const { data } = await axios.post('/api/ai/generate', {
                prompt,
                question,
                contribution,
                type: 'contribution',
                user
            });
            return data.insights as string | null;
        },
    });
}