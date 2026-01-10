import { Database } from '@/types/database.types'

type TableName = keyof Database['public']['Tables']
type Row<T extends TableName> = Database['public']['Tables'][T]['Row']
type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert']
type Update<T extends TableName> = Database['public']['Tables'][T]['Update']

// Recursive chain interface
interface SelectFilterBuilder<R> {
    eq: (col: string, val: unknown) => SelectFilterBuilder<R>
    neq: (col: string, val: unknown) => SelectFilterBuilder<R>
    gt: (col: string, val: unknown) => SelectFilterBuilder<R>
    lt: (col: string, val: unknown) => SelectFilterBuilder<R>
    gte: (col: string, val: unknown) => SelectFilterBuilder<R>
    lte: (col: string, val: unknown) => SelectFilterBuilder<R>
    in: (col: string, val: unknown[]) => SelectFilterBuilder<R>
    is: (col: string, val: unknown) => SelectFilterBuilder<R>
    order: (col: string, opts?: { ascending?: boolean }) => SelectFilterBuilder<R>
    limit: (n: number) => SelectFilterBuilder<R>
    single: () => Promise<{ data: R | null; error: unknown }>
    then: <TResult1 = { data: R[] | null; error: unknown }, TResult2 = never>(
        onfulfilled?: ((value: { data: R[] | null; error: unknown }) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined
    ) => Promise<TResult1 | TResult2>
}

export interface SafeSelectBuilder<T extends TableName | string, R = T extends TableName ? Row<T> : Record<string, unknown>> {
    select: (query?: string) => SelectFilterBuilder<R>
}

interface UpdateFilterBuilder<R> {
    eq: (col: string, val: unknown) => UpdateFilterBuilder<R>
    select: () => {
        single: () => Promise<{ data: R | null; error: unknown }>
        then: <TResult1 = { data: R[] | null; error: unknown }, TResult2 = never>(
            onfulfilled?: ((value: { data: R[] | null; error: unknown }) => TResult1 | PromiseLike<TResult1>) | null | undefined,
            onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined
        ) => Promise<TResult1 | TResult2>
    }
    then: <TResult1 = { data: null; error: unknown }, TResult2 = never>(
        onfulfilled?: ((value: { data: null; error: unknown }) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined
    ) => Promise<TResult1 | TResult2>
}

export interface SafeUpdateBuilder<T extends TableName | string, R = T extends TableName ? Row<T> : Record<string, unknown>> {
    update: (data: T extends TableName ? Update<T> : Record<string, unknown>) => UpdateFilterBuilder<R>
}

interface InsertFilterBuilder<R> {
    select: (query?: string) => {
        single: () => Promise<{ data: R | null; error: unknown }>
        then: <TResult1 = { data: R[] | null; error: unknown }, TResult2 = never>(
            onfulfilled?: ((value: { data: R[] | null; error: unknown }) => TResult1 | PromiseLike<TResult1>) | null | undefined,
            onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined
        ) => Promise<TResult1 | TResult2>
    }
    then: <TResult1 = { data: null; error: unknown }, TResult2 = never>(
        onfulfilled?: ((value: { data: null; error: unknown }) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined
    ) => Promise<TResult1 | TResult2>
}

export interface SafeInsertBuilder<T extends TableName | string, R = T extends TableName ? Row<T> : Record<string, unknown>> {
    insert: (data: T extends TableName ? (Insert<T> | Insert<T>[]) : (Record<string, unknown> | Record<string, unknown>[])) => InsertFilterBuilder<R>
    upsert: (data: T extends TableName ? (Insert<T> | Insert<T>[]) : (Record<string, unknown> | Record<string, unknown>[]), options?: { onConflict?: string, ignoreDuplicates?: boolean }) => InsertFilterBuilder<R>
}

interface DeleteFilterBuilder {
    eq: (col: string, val: unknown) => DeleteFilterBuilder
    then: <TResult1 = { data: null; error: unknown; count: number | null }, TResult2 = never>(
        onfulfilled?: ((value: { data: null; error: unknown; count: number | null }) => TResult1 | PromiseLike<TResult1>) | null | undefined,
        onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined
    ) => Promise<TResult1 | TResult2>
}

export interface SafeDeleteBuilder {
    delete: (opts?: { count?: 'exact' | 'planned' | 'estimated' }) => DeleteFilterBuilder
}
