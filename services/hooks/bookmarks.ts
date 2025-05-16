import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "./query-keys";
import { createBookmark, deleteBookmark, getBookmark, getBookmarks } from "@/services/bookmarks";

interface BookmarkPayload {
    params?: Record<string, string | number | boolean>;
}

export const useBookmarks = (payload?: BookmarkPayload) => {
    return useQuery({
        queryKey: [QUERY_KEYS.get_bookmarks, payload],
        queryFn: async () => {
            return getBookmarks(payload);
        },
    });
};

export const useBookmark = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.get_bookmark, id],
        queryFn: async () => {
            return getBookmark(id);
        },
    });
};

export const useCreateBookmark = () => {
    return useMutation({
        mutationKey: [QUERY_KEYS.create_bookmark],
        mutationFn: (payload: { past_question_id: string }) => {
            return createBookmark(payload);
        },
    });
};

export const useDeleteBookmark = () => {
    return useMutation({
        mutationKey: [QUERY_KEYS.delete_bookmark],
        mutationFn: (id: string) => {
            return deleteBookmark(id);
        },
    });
};
