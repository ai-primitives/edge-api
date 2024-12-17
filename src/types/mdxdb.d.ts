declare module '@mdxdb/fetch' {
  export class FetchProvider {
    constructor(options: { namespace: string; baseUrl: string })
    query(query: string): Promise<any>
  }
}
