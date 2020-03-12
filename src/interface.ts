export type HttpVerbs = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'
export type GetHeadRequest = (resource: string, init?: RequestInit) => Promise<FetchyResponse>
export type BodyFirstRequest = (
  resource: string,
  body?: Json,
  init?: RequestInit
) => Promise<FetchyResponse>

export interface Json {
  [x: string]: string | number | boolean | Date | Json | JsonArray
}

export interface JsonArray extends Array<string | number | boolean | Date | Json | JsonArray> {}

export interface FetchyResponse extends Response {
  arrayBuffer(): Promise<ArrayBuffer>
  blob(): Promise<Blob>
  formData(): Promise<FormData>
  json<T>(): Promise<T>
  text(): Promise<string>
}

export interface Meta {
  _fetch: typeof window.fetch
  baseResource: string
  init?: RequestInit
}

export interface Defaults {
  baseResource?: string
  init?: RequestInit
  interceptors?: (resource: RequestInfo, init?: RequestInit) => any
  timeout?: number
}
