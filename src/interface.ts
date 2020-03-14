export type HttpVerbs = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'
export type GetHeadRequest = (url: string, init?: RequestInit) => FetchyResponse
export type BodyFirstRequest = (
  url: string,
  body?: Json | null,
  init?: RequestInit
) => FetchyResponse

export interface Json {
  [x: string]: string | number | boolean | Date | Json | JsonArray
}

export interface JsonArray extends Array<string | number | boolean | Date | Json | JsonArray> {}

export interface FetchyResponse extends Promise<Response> {
  arrayBuffer(): Promise<ArrayBuffer>
  blob(): Promise<Blob>
  formData(): Promise<FormData>
  json<T>(): Promise<T>
  text(): Promise<string>
}

export interface Meta {
  _fetch: typeof fetch
  baseUrl: string
  init?: RequestInit
}

export interface Defaults {
  baseUrl?: string
  init?: RequestInit
  interceptors?: (url: RequestInfo, init?: RequestInit) => any
  timeout?: number
}
