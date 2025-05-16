export interface StackResponse<T> {
    message: string
    data: T
    error: { message?: string, details?: any } | string | Array | null
    status: number
}

export interface PaginatedStackResponse<T> {
    count: number
    next: string
    previous: string
    message: string
    data: T
    status: number
    error: { message?: string, details?: any } | string | Array | null
}