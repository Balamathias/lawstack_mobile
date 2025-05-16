import { useMutation, useQuery } from "@tanstack/react-query";
import { QUERY_KEYS } from "./query-keys";
import { createNote, deleteNote, getNote, getNotes } from "@/services/notes";
import { Note } from "@/@types/db";

interface NotePayload {
    params?: Record<string, string | number | boolean>;
}

export const useNotes = (payload?: NotePayload) => {
    return useQuery({
        queryKey: [QUERY_KEYS.get_notes, payload],
        queryFn: async () => {
            return getNotes(payload);
        },
    });
};

export const useNote = (id: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.get_notes, id],
        queryFn: async () => {
            return getNote(id);
        },
    });
};

export const useCreateNote = () => {
    return useMutation({
        mutationKey: [QUERY_KEYS.create_note],
        mutationFn: (payload: Partial<Note>) => {
            return createNote(payload);
        },
    });
};

export const useDeleteNote = () => {
    return useMutation({
        mutationKey: [QUERY_KEYS.delete_note],
        mutationFn: (id: string) => {
            return deleteNote(id);
        },
    });
};

// export const useUpdateNote = () => {
//     return useMutation({
//         mutationKey: [QUERY_KEYS.update_note],
//         mutationFn: ({ id, payload }: { id: string; payload: Partial<Note> }) => {
//             return updateNote(id, payload);
//         },
//     });
// };
