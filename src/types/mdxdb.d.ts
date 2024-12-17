declare module '@mdxdb/fetch' {
  export interface Document {
    [key: string]: unknown
  }

  export interface DatabaseProvider<T extends Document = Document> {
    namespace: string
    connect(): Promise<void>
    disconnect(): Promise<void>
    list(): Promise<string[]>
    collection(name: string): CollectionProvider<T>
  }

  export interface CollectionProvider<T extends Document = Document> {
    path: string
    find(filter: Record<string, unknown>, options?: Record<string, unknown>): Promise<T[]>
    search(query: string, options?: Record<string, unknown>): Promise<T[]>
    vectorSearch(options: Record<string, unknown>): Promise<T[]>
  }

  export interface FetchProviderOptions {
    namespace: string
    baseUrl: string
    headers?: Record<string, string>
    timeout?: number
    retries?: number
    retryDelay?: number
  }

  export class FetchProvider<T extends Document = Document> implements DatabaseProvider<T> {
    readonly namespace: string
    constructor(options: FetchProviderOptions)
    connect(): Promise<void>
    disconnect(): Promise<void>
    list(): Promise<string[]>
    collection(name: string): CollectionProvider<T>
  }
}
