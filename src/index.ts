type HttpVerbs = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD'

const isHeadOrGet = (verb: HttpVerbs) => verb === 'HEAD' || verb === 'GET'

// TODO: add a timeout
// TODO: interceptors

const bodyTransform = [
  'arrayBuffer',
  'blob',
  'formData',
  'json',
  'text',
] as const

interface Json {
  [x: string]: string | number | boolean | Date | Json | JsonArray
}

interface JsonArray
  extends Array<string | number | boolean | Date | Json | JsonArray> {}

interface FetchyResponse extends Response {
  arrayBuffer(): Promise<ArrayBuffer>
  blob(): Promise<Blob>
  formData(): Promise<FormData>
  json<T>(): Promise<T>
  text(): Promise<string>
}

const attachBodyTransformsToResponse = async (
  _response: Response
): Promise<FetchyResponse> => {
  let response: FetchyResponse = _response
  for (const methods of bodyTransform) {
    response[methods] = await _response[methods]()
  }
  return response
}

const transformResponse = (response: Response): Promise<FetchyResponse> => {
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return attachBodyTransformsToResponse(response)
}

interface Meta {
  _fetch: typeof window.fetch
  verb: HttpVerbs
  baseResource?: string
  init?: RequestInit
}

interface Defaults {
  baseResource?: string
  init?: RequestInit
  interceptors?: any
  timeout?: number
}

// TODO: add a meta object { fetch, verb, defaults }
const originalFetch = async (
  _fetch: typeof window.fetch,
  verb: HttpVerbs,
  resource: string,
  init?: RequestInit
) => {
  const _init = {
    method: verb,
    ...init,
  }
  const response = await _fetch(resource, _init)
  return transformResponse(response)
}

const jsonBodyFirstFetch = async (
  _fetch: typeof window.fetch,
  verb: HttpVerbs,
  resource: string,
  body?: Json,
  init?: RequestInit
) => {
  const _init: RequestInit = {
    method: verb,
    ...(body && { body: JSON.stringify(body) }),
    ...(init && init),
  }

  const response = await _fetch(resource, _init)
  return transformResponse(response)
}

function instance(
  _fetch: typeof window.fetch,
  verb: 'GET' | 'HEAD'
): (resource: string, init?: RequestInit) => Promise<FetchyResponse>
function instance(
  _fetch: typeof window.fetch,
  verb: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
): (
  resource: string,
  body?: Json,
  init?: RequestInit
) => Promise<FetchyResponse>
function instance(_fetch: typeof window.fetch, verb: HttpVerbs) {
  if (isHeadOrGet(verb)) {
    return originalFetch.bind(null, _fetch, verb)
  }
  return jsonBodyFirstFetch.bind(null, _fetch, verb)
}

function initialize(defaults?: Defaults) {
  return {
    get: instance(fetch, 'GET'),
    post: instance(fetch, 'POST'),
    put: instance(fetch, 'PUT'),
    delete: instance(fetch, 'DELETE'),
    patch: instance(fetch, 'PATCH'),
    head: instance(fetch, 'HEAD'),
  }
}
export function create(
  baseResource: string,
  interceptors: any,
  init?: RequestInit
) {
  return initialize({ baseResource, interceptors, init })
}

export default initialize()
